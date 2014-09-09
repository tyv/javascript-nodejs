const parseAndTransform = require('./parseAndTransform');
const _ = require('lodash');
const config = require('config');

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
  return [].concat(this._libsToJsCss( this._unmapLibsNames(this.metadata.libs.toArray()) ).css, this.metadata.head)
    .filter(Boolean).join("\n");
};

// js at bottom
ArticleRenderer.prototype.getFoot = function() {
  return this._libsToJsCss( this._unmapLibsNames(this.metadata.libs.toArray()) ).js
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
    js: js,
    css: css
  };
};


ArticleRenderer.prototype.render = function* (article) {
  const options = {
    staticHost: config.staticHost,
    resourceWebRoot: article.getResourceWebRoot(),
    metadata:        this.metadata,
    trusted:         true,
    removeFirstHeader: true
  };

  var node = yield parseAndTransform(article.content, options);
  return node.toFinalHtml();
};


module.exports = ArticleRenderer;
