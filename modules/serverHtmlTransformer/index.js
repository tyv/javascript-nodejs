var HtmlTransformer = require('simpledownParser').HtmlTransformer;
var ParseError = require('simpledownParser').ParseError;
var inherits = require('inherits');
const Reference = require('tutorial/models/reference');
const log = require('log')();
const Article = require('tutorial/models/article');
const Plunk = require('plunk').Plunk;
const Task = require('tutorial/models/task');
const ErrorTag = require('simpledownParser').ErrorTag;
const TextNode = require('simpledownParser').TextNode;
const CompositeTag = require('simpledownParser').CompositeTag;
const url = require('url');
const path = require('path');
const config = require('config');
const fs = require('mz/fs');
var jade = require('lib/serverJade');
var bem = require('bem-jade');
var gm = require('gm');
var thunkify = require('thunkify');
var imageSize = thunkify(require('image-size'));
var escapeHtml = require('escape-html');

var codeTabsTemplate = require('./templates/codeTabs.jade');

function ServerHtmlTransformer(options) {

  HtmlTransformer.apply(this, arguments);
}

inherits(ServerHtmlTransformer, HtmlTransformer);

ServerHtmlTransformer.prototype.transform = function*(node, applyContextTypography) {

  var method = this['transform' + node.getType()];

  if (!method) {
    throw new Error("Unsupported node type: " + node.getType());
  }

  var html;
  try {
    if (method.constructor.name == 'GeneratorFunction') {
      html = yield method.call(this, node);
    } else {
      html = method.call(this, node);
    }
  } catch (e) {
    if (e instanceof ParseError) {
      html = this.transformErrorTag(new ErrorTag(e.tag, e.message));
    } else {
      throw e;
    }
  }


  if (applyContextTypography) {
    html = this.applyContextTypography(html);
  }

  return html;
};

function* resolveReference(value) {
  if (value[0] == '#') {
    var ref = yield Reference.findOne({anchor: value.slice(1)}).populate('article', 'slug title').exec();
    if (!ref) {
      return null;
    }
    if (!ref.article) {
      log.error("No article for reference", ref.toObject());
    }
    return ref && {title: ref.article.title, url: ref.getUrl()};
  }

  if (value.indexOf('/task/') === 0) {
    var task = yield Task.findOne({slug: value.slice('/task/'.length)}, 'slug title').exec();
    return task && {title: task.title, url: task.getUrl()};
  }

  var article = yield Article.findOne({slug: value.slice(1)}, 'slug title').exec();
  return article && {title: article.title, url: article.getUrl()};
}


ServerHtmlTransformer.prototype.transformCompositeTag = function* (node) {
  var labels = {};
  var html = '';

  var children = node.getChildren();

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    var childHtml = yield this.transform(child);

    if (child.getType() != 'TextNode') {
      childHtml = this.replaceHtmlWithLabel(child.tag, childHtml, labels);
    }

    html += childHtml;
  }

  node.ensureKnowTrusted();

  html = this.formatHtml(html, node.isTrusted());

  html = this.replaceLabels(html, labels);

  if (node.tag) {
    html = this.wrapTagAround(node.tag, node.attrs, html);
  }

  return html;
};

ServerHtmlTransformer.prototype.transformEditTag = function*(node) {
  // load plunk from DB
  if (node.attrs.src) {
    var plunk = yield Plunk.findOne({webPath: this.resourceWebRoot + '/' + node.attrs.src}).exec();
    if (!plunk) {
      throw new ParseError("div", "Нет такого plunk.");
    }
    node.attrs.plunkId = plunk.plunkId;
  }

  return HtmlTransformer.prototype.transformEditTag.call(this, node);

};

ServerHtmlTransformer.prototype.transformLinkTag = function*(node) {

  var ref;
  if (node.attrs.href[0] == '/' && !node.getChildren().length) {
    ref = node.attrs.href;
  } else if (node.attrs.href[0] == '#') {
    ref = node.attrs.href;
  }

  if (ref) {
    const referenceObj = yield* resolveReference(ref);

    if (!referenceObj) {
      throw new ParseError('span', 'Нет такой ссылки: ' + ref);
    }

    node.attrs.href = referenceObj.url;

    if (node.getChildren().length === 0) {
      if (ref[0] == '#') {
        node.appendChild(new TextNode(ref.slice(1)));
      } else {
        node.appendChild(new TextNode(referenceObj.title));
      }
    }

  }

  return yield* HtmlTransformer.prototype.transformLinkTag.call(this, node);
};


ServerHtmlTransformer.prototype.transformIframeTag = function*(node) {
  // load plunk from DB
  if (node.attrs.edit) {
    var plunk = yield Plunk.findOne({webPath: this.resourceWebRoot + '/' + node.attrs.src}).exec();
    if (!plunk) {
      throw new ParseError("div", "Нет такого plunk.");
    }
    node.attrs.plunkId = plunk.plunkId;
  }

  return HtmlTransformer.prototype.transformIframeTag.call(this, node);
};

ServerHtmlTransformer.prototype.transformImgTag = function*(node) {

  if (!/\.(png|jpg|gif|jpeg|svg)$/i.test(node.attrs.src)) {
    throw new ParseError("div", "Неподдерживамое расширение, должно оканчиваться на png/jpg/gif/jpeg/svg: " + node.attrs.src);
  }

  // external srcs go "as is"
  if (~node.attrs.src.indexOf('://') || node.attrs.src.startsWith('//')) {
    return HtmlTransformer.prototype.transformImgTag.call(this, node);
  }

  var src = node.attrs.src[0] == '/' ? node.attrs.src : path.join(this.resourceWebRoot, node.attrs.src);

  var imagePath = this._srcUnderRoot(config.publicRoot, src);

  var stat;

  try {
    stat = yield fs.stat(imagePath);
  } catch (e) {
    throw new ParseError("div", "Нет такого файла: " + node.attrs.src +
      (process.env.NODE_ENV == 'development' ? " [" + imagePath + "]" : "")
    );
  }

  if (!stat.isFile()) {
    throw new ParseError("div", "Не файл: " + node.attrs.src);
  }

  if (!node.attrs.width || !node.attrs.height) {

    var size;

    try {
      if (/\.svg$/i.test(this.src)) {
        var size = yield function(callback) {
          // GraphicsMagick fails with `gm identify my.svg`
          gm(imagePath).options({imageMagick: true}).identify('{"width":%w,"height":%h}', callback);
        };

        size = JSON.parse(size); // warning: no error processing
      } else {
        size = yield imageSize(imagePath);
      }

    } catch (e) {
      throw new ParseError('div', e.message);
    }

    node.attrs.width = size.width;
    node.attrs.height = size.height;
  }

  node.attrs.src = this.staticHost + src;

  return HtmlTransformer.prototype.transformImgTag.call(this, node);
};

ServerHtmlTransformer.prototype.transformCodeTabsTag = function* (node) {

  var src = path.join(this.resourceWebRoot, node.attrs.src);

  var plunk = yield Plunk.findOne({webPath: src}).exec();

  if (!plunk) {
    throw new ParseError('div', 'No such plunk');
  }

  if (this.isEbook) {
    var title = node.attrs.title || 'Смотреть пример онлайн';
    return '<p><a target="_blank" href="http://plnkr.co/edit/' + plunk.plunkId + '?p=preview">' + escapeHtml(title) + '</a></p>';
  }

  var files = plunk.files;

  var tabs = [];

  var prismLanguageMap = {
    html:   'markup',
    js:     'javascript',
    json:   'javascript',
    coffee: 'coffeescript'
  };

  var languagesSupported = 'markup css c javascript coffeescript http scss sql php python ruby java'.split(' ');

  var hasServerJs = false;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var ext = path.extname(file.filename).slice(1);

    var prismLanguage = prismLanguageMap[ext] || ext;

    if (!~languagesSupported.indexOf(prismLanguage)) prismLanguage = 'none';

    var languageClass = 'language-' + prismLanguage + ' line-numbers';

    tabs.push({
      title:   file.filename,
      class:   languageClass,
      content: file.content
    });

    if (file.filename == 'server.js') {
      hasServerJs = true;
    }
  }

  var height = parseInt(node.attrs.height) || 200;

  var locals = {
    tabs:   tabs,
    height: node.isTrusted() ? height : Math.min(height, 800),
    src:    src + '/'
  };

  if (hasServerJs) {
    locals.zip = {
      href: '/tutorial/zipview/' + path.basename(src) + '.zip?plunkId=' + plunk.plunkId
    };
  } else {
    locals.edit = {
      href:    'http://plnkr.co/edit/' + plunk.plunkId + '?p=preview',
      plunkId: plunk.plunkId
    };
  }

  locals.external = {
    href: src + '/'
  };

  var rendered = codeTabsTemplate(locals);

  return this.wrapTagAround('no-typography', {}, rendered);
};

/*

 options = {
 'class' => 'result__iframe',
 'data-trusted' => @trusted ? '1' : '0'
 }

 if @params['height']
 options['data-demo-height'] = @params['height']
 else
 options['data-demo-height'] = '350'
 end

 #options['src'] = prefix_relative_src(@params['src']) + "/"

 begin
 plunk_id = read_plunk_id(@params['src'])
 options['data-play'] = plunk_id
 rescue => e
 return Node::ErrorTag.new(:div, "#{@bbtag}: нет такой песочницы #{@params['src']}")
 end

 options['src'] = "http://embed.plnkr.co/#{plunk_id}/preview"

 options['data-zip'] = "1" if @params['zip']

 Node::Tag.new(:iframe, "", options)

 end
 */

ServerHtmlTransformer.prototype._srcUnderRoot = function(root, src) {
  src = path.join(root, src);

  if (src.slice(0, root.length + 1) != root + '/') {
    throw new ParseError("div", "src goes outside of root: " + src);
  }

  return src;
};

ServerHtmlTransformer.prototype.transformSourceTag = function* (node) {

  if (node.attrs.src) {
    var sourcePath = this._srcUnderRoot(config.publicRoot, path.join(this.resourceWebRoot, node.attrs.src));

    var content;

    try {
      content = yield fs.readFile(sourcePath, 'utf-8');
    } catch (e) {
      throw new ParseError('div', "Не могу прочитать файл: " + node.src +
        (process.env.NODE_ENV == 'development' ? " [" + sourcePath + "]" : "")
      );
    }

    node.text = content;
  }

  return HtmlTransformer.prototype.transformSourceTag.call(this, node);

};

ServerHtmlTransformer.prototype.transformHeaderTag = function(node) {
  var headerContent = this.transformVerbatimText(node);

  if (this.linkHeaderTag) {
    return '<h' + node.level + '><a class="main__anchor" name="' + node.anchor + '" href="#' + node.anchor + '">' +
      headerContent +
      '</a></h' + node.level + '>';
  } else {
    // for ebook need id
    return '<h' + node.level + ' id="' + node.anchor + '">' + headerContent + '</h' + node.level + '>';
  }

};

module.exports = ServerHtmlTransformer;
