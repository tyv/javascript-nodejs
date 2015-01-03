const _ = require('lodash');
const config = require('config');
const BodyParser = require('simpledownParser').BodyParser;
const ServerHtmlTransformer = require('parser/serverHtmlTransformer');

// Порядок библиотек на странице
// - встроенный CSS
// - библиотеки CSS
// - [head] (css, important short js w/o libs, js waits libs on DocumentContentLoaded)
// ...
// - встроенный JS
// - библиотеки JS

/**
 * Can render many articles, keeping metadata
 * @constructor
 */
function ArticleRenderer() {
  this.metadata = {};
}

// gets <head> content from metadata.libs & metadata.head
ArticleRenderer.prototype.getHead = function() {
  return [].concat(
    this._libsToJsCss(
      this._unmapLibsNames(this.metadata.libs.toArray())
    ).css,
    this._libsToJsCss(
      this._unmapLibsNames(this.metadata.libs.toArray())
    ).js,
    this.metadata.head)
    .filter(Boolean).join("\n");
};

// js at bottom
ArticleRenderer.prototype.getFoot = function() {
  return this._libsToJsCss(this._unmapLibsNames(this.metadata.libs.toArray())).js
    .filter(Boolean).join("\n");
};

// Все библиотеки должны быть уникальны
// Если один ресурс требует JQUERY и другой тоже, то нужно загрузить только один раз JQUERY
// Именно форматтер окончательно форматирует библиотеки, т.к. он знает про эти мапппинги
//
// Кроме того, парсер может распарсить много документов для сбора метаданных
ArticleRenderer.prototype._unmapLibsNames = function(libs) {
  var libsUnmapped = [];

  // заменить все-все короткие имена
  // предполагается, что короткое имя при раскрытии не содержит другого короткого имени (легко заимплементить)

  libs.forEach(function(lib) {
    switch (lib) {
    case 'd3':
      libsUnmapped.push("http://d3js.org/d3.v3.min.js");
      break;
    case 'domtree':
      libsUnmapped.push("domtree.css", "domtree.js");
      break;
    default:
      libsUnmapped.push(lib);
    }
  });

  return libsUnmapped;
};


ArticleRenderer.prototype._libsToJsCss = function(libs) {
  var js = [];
  var css = [];

  _.uniq(libs).forEach(function(lib) {
    if (!~lib.indexOf('://')) {
      lib = 'http://js.cx/libs/' + lib;
    }

    if (lib.slice(-3) == '.js') {
      js.push('<script src="' + lib + '"></script>');
    } else if (lib.slice(-4) == '.css') {
      css.push("<link rel='stylesheet' href='" + lib + "'>");
    } else {
      js.push("<script> alert('Unknown extension for: '" + lib + "');</script>");
    }
  });

  return {
    js:  js,
    css: css
  };
};

/**
 * Render, gather metadata to the renderer object
 * @param article
 * @param options
 * options.noStripTitle disables stripping of the first header
 * options.headerLevelShift shifts all headers (to render in ebook as a subchapter0
 * @returns {{content: *, headers: *, head: *, foot: *}}
 */
ArticleRenderer.prototype.render = function* (article, options) {
  options = Object.create(options || {});
  options.metadata = this.metadata;
  options.trusted = true;


  // shift off the title header
  const node = new BodyParser(article.content, options).parseAndWrap();

  if (!options.noStripTitle) {
    node.removeChild(node.getChild(0));
  }

  this.headers = [];

  node.getChildren().forEach(function(child) {
    if (child.getType() != 'HeaderTag') return;

    if (options.headerLevelShift) {
      child.level += options.headerLevelShift;
    }

    this.headers.push({
      level: child.level,
      anchor: child.anchor,
      title: child.text
    });

  }, this);

  const transformer = new ServerHtmlTransformer({
    staticHost:      config.server.staticHost,
    resourceWebRoot: article.getResourceWebRoot(),
    linkHeaderTag: true
  });

  this.content = yield* transformer.transform(node, true);

  return {
    content: this.content,
    headers: this.headers,
    head:    this.getHead(),
    foot:    this.getFoot()
  };
};

/**
 * Render with cache
 * @param article
 * @param options Add refreshCache: true not to use the cached value
 * @returns {*}
 */
ArticleRenderer.prototype.renderWithCache = function*(article, options) {
  options = options || {};

  if (article.rendered && !options.refreshCache) return article.rendered;

  var rendered = yield* this.render(article);

  article.rendered = rendered;

  yield article.persist();

  return rendered;
};


module.exports = ArticleRenderer;
