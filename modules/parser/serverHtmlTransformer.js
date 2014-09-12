var HtmlTransformer = require('javascript-parser').HtmlTransformer;
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
  if (method.constructor.name == 'GeneratorFunction') {
    html = yield method.call(this, node);
  } else {
    html = method.call(this, node);
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

  const referenceObj = yield resolveReference(node.ref);

  if (!referenceObj) {
    return this.transformErrorTag(new ErrorTag('span', 'Нет такой ссылки: ' + node.ref));
  }

  var newNode = new CompositeTag('a', node.getChildren(), {href: referenceObj.url});

  if (newNode.getChildren().length === 0) {
    if (node.ref[0] == '#') {
      newNode.appendChild(new TextNode(node.ref.slice(1)));
    } else {
      newNode.appendChild(new TextNode(referenceObj.title));
    }
  }

  return this.transformCompositeTag(newNode);
};

ServerHtmlTransformer.prototype.transformImgTag = function*(node) {

  if (node.attrs.width && node.attrs.height) return;

  // remove host
  var srcPath = url.parse(node.attrs.src);
  srcPath.protocol = srcPath.slashes = srcPath.host = srcPath.hostname = null;
  srcPath = url.format(srcPath);

  var imagePath = path.join(config.publicRoot, srcPath);

  // path out of our root folder
  if (imagePath.slice(0, config.publicRoot.length + 1) != config.publicRoot + '/') return;

  if (!/\.(png|jpg|gif|jpeg|svg)$/i.test(imagePath)) {
    return this.transformErrorTag(new ErrorTag("div", "Неподдерживамое расширение, должно оканчиваться на png/jpg/gif/jpeg/svg: " + node.attrs.src));
  }

  var stat;

  try {
    stat = yield fs.stat(imagePath);
  } catch (e) {
    return this.transformErrorTag(new ErrorTag("div", "Нет такого файла: " + node.attrs.src +
        (process.env.NODE_ENV == 'development' ? " [" + imagePath + "]" : "")
    ));
  }

  if (!stat.isFile()) {
    return this.transformErrorTag(new ErrorTag("div", "Не файл: " + node.attrs.src));
  }

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
    return this.transformErrorTag(new ErrorTag('div', e.message));
  }

  node.attrs.width = size.width;
  node.attrs.height = size.height;

  return HtmlTransformer.prototype.transformImgTag.call(this, node);
};

ServerHtmlTransformer.prototype.transformSourceTag = function* (node) {

  if (node.src) {

    var sourcePath = path.join(config.publicRoot, node.src);
    // path out of our root folder
    if (sourcePath.slice(0, config.publicRoot.length + 1) != config.publicRoot + '/') return;

    var content;

    try {
      content = yield fs.readFile(sourcePath, 'utf-8');
    } catch (e) {
      return this.transform(new ErrorTag('div', "Не могу прочитать файл: " + node.src +
          (process.env.NODE_ENV == 'development' ? " [" + sourcePath + "]" : ""))
      );
    }

    node.setTextFromSrc(content);
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
