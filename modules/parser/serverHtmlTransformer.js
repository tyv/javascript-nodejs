var HtmlTransformer = require('javascript-parser').HtmlTransformer;
var ParseError = require('javascript-parser').ParseError;
var inherits = require('inherits');
const Reference = require('tutorial/models/reference');
const Article = require('tutorial/models/article');
const Task = require('tutorial/models/task');
const ErrorTag = require('javascript-parser').ErrorTag;
const TextNode = require('javascript-parser').TextNode;
const CompositeTag = require('javascript-parser').CompositeTag;
const url = require('url');
const path = require('path');
const config = require('config');
const fs = require('mz/fs');
var jade = require('jade');
var bem = require('bem-jade');
var gm = require('gm');
var thunkify = require('thunkify');
var imageSize = thunkify(require('image-size'));

function ServerHtmlTransformer(options) {
  HtmlTransformer.apply(this, arguments);
}

inherits(ServerHtmlTransformer, HtmlTransformer);

ServerHtmlTransformer.prototype.transform = function*(node, isFinal) {

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


  if (isFinal) {
    html = this.finalize(html);
  }

  return html;
};

function* resolveReference(value) {
  if (value[0] == '#') {
    var ref = yield Reference.findOne({anchor: value.slice(1)}).populate('article', 'slug title').exec();
    return ref && { title: ref.article.title, url: ref.getUrl() };
  }

  if (value.indexOf('/task/') === 0) {
    var task = yield Task.findOne({slug: value.slice('/task/'.length)}, 'slug title').exec();
    return task && {title: task.title, url: task.getUrl()};
  }

  var article = yield Article.findOne({slug: value.slice(1)}, 'slug title').exec();
  return article && {title: article.title, url: article.getUrl()};
}

HtmlTransformer.prototype.transformCompositeTag = function* (node) {
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

ServerHtmlTransformer.prototype.transformReferenceNode = function*(node) {

  const referenceObj = yield* resolveReference(node.ref);

  if (!referenceObj) {
    throw new ParseError('span', 'Нет такой ссылки: ' + node.ref);
  }

  var newNode = new CompositeTag('a', node.getChildren(), {href: referenceObj.url});

  if (newNode.getChildren().length === 0) {
    if (node.ref[0] == '#') {
      newNode.appendChild(new TextNode(node.ref.slice(1)));
    } else {
      newNode.appendChild(new TextNode(referenceObj.title));
    }
  }

  node.parent.replaceChild(newNode, node);

  return yield* this.transformCompositeTag(newNode);
};

ServerHtmlTransformer.prototype.transformImgTag = function*(node) {

  if (!/\.(png|jpg|gif|jpeg|svg)$/i.test(node.attrs.src)) {
    throw new ParseError("div", "Неподдерживамое расширение, должно оканчиваться на png/jpg/gif/jpeg/svg: " + node.attrs.src);
  }

  if (~node.attrs.src.indexOf('://')) {
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

function* readPlunkId(dirPath) {

  var plnkrPath = path.join(dirPath, '.plnkr');

  var info;
  try {

    info = JSON.parse(yield fs.readFile(plnkrPath));

  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new ParseError('div', 'incorrect .plnkr');
    } else {
      throw new ParseError('div', "can't read .plnkr from " + dirPath);
    }
  }

  return info.plunk;
}

ServerHtmlTransformer.prototype.transformCodeTabsTag = function* (node) {

  var src = path.join(this.resourceWebRoot, node.attrs.src);

  var srcPath = this._srcUnderRoot(config.publicRoot, src);

  // check to see if it's an example, not any folder
  yield readPlunkId(srcPath);

  var files = yield fs.readdir(srcPath);
  files = files.filter(function(fileName) {
    return fileName[0] != '.';
  });

  files.sort(function(nameA, nameB) {

    var extA = path.extname(nameA);
    var extB = path.extname(nameB);

    function compare(ext) {
      if (extA == ext && extB == ext) {
        return nameA > nameB ? 1 : -1;
      }

      if (extA == ext) return -1;
      if (extB == ext) return 1;
    }

    // html always first, then js, then css, then generic comparison
    return compare('.html') || compare('.js') || compare('.css') || (nameA > nameB ? 1 : -1);
  });
  /*
   var tabs = [{
   title: 'Результат',
   selected: !node.attrs.selected, // if nothing is selected, select this
   content:
   }];*/
  var tabs = [];


  var prismLanguageMap = {
    html:   'markup',
    js:     'javascript',
    coffee: 'coffeescript'
  };

  for (var i = 0; i < files.length; i++) {
    var name = files[i];

    var ext = path.extname(name).slice(1);

    var prismLanguage = prismLanguageMap[ext] || ext;

    var languageClass = 'language-' + prismLanguage + ' line-numbers';

    var content = yield fs.readFile(path.join(srcPath, name), 'utf-8');
    tabs.push({
      title:   name,
      class: languageClass,
      content: content
    });
  }

  var height = parseInt(node.attrs.height) || '';

  var rendered = jade.renderFile(require.resolve('./templates/codeTabs.jade'), {
    bem:    bem(),
    tabs:   tabs,
    height: height && (node.isTrusted() ? height : Math.max(height, 800)),
    src:    src + '/'
  });

//  console.log("---> height", height && (node.isTrusted() ? height : Math.max(height, 800)));
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
    return '<h' + node.level + '>' + headerContent + '</h' + node.level + '>';
  }

};

module.exports = ServerHtmlTransformer;
