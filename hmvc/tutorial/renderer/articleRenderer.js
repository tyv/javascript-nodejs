const ReferenceTransformer = require('parser/referenceTransformer');
const ImgSizeTransformer = require('parser/imgSizeTransformer');
const SourceFileTransformer = require('parser/sourceFileTransformer');
//const TaskResolver = require('./taskResolver').TaskResolver;
const BodyParser = require('javascript-parser').BodyParser;
var log = require('js-log')();

/**
 * Can render many articles, keeping metadata
 * @constructor
 */
function ArticleRenderer() {
  this.metadata = {};
}

// gets <head> content from metadata.libs & metadata.head
ArticleRenderer.prototype.formatHead = function() {


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


// CSS важнее, ставим его наверх
// для оптимального порядка загрузки и выполнения скриптов
// (обычно скрипт ждет CSS, чтобы выполниться)
ArticleRenderer.prototype._libsToCss = function(libs) {


};
    def libs_to_css_js(libs)

      js = []
      css = []
      libs.uniq.each do |lib|
        lib = File.join("http://js.cx/libs", lib) unless lib['://']
        if lib[-3..-1] == '.js'
          js << "<script src='#{lib}'></script>"
        elsif lib[-4..-1] == '.css'
          css << "<link rel='stylesheet' href='#{lib}'>"
        else
          js << "<script> alert('Unknown extension for: #{lib}');</script>"
        end
      end

      return css, js

    end
  end

ArticleRenderer.prototype.render = function* (article) {

  var d = new Date();
  const options = {
    resourceRoot: article.getResourceWebRoot(),
    metadata:        this.metadata,
    trusted:         true
  };

  // shift off the title header
  const articleNode = new BodyParser(article.get('content'), options).parseAndWrap();
  articleNode.removeChild(articleNode.getChild(0));

  const referenceTransformer = new ReferenceTransformer(articleNode);
  yield referenceTransformer.run();

  const imgSizeTransformer = new ImgSizeTransformer(articleNode);
  yield imgSizeTransformer.run();

  const sourceFileTransformer = new SourceFileTransformer(articleNode);
  yield sourceFileTransformer.run();

  const content = articleNode.toFinalHtml();
  log.debug(new Date() - d);
  return content;
};


module.exports = ArticleRenderer;
