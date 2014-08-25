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

//  const taskResolver = new TaskResolver(articleNode);
//  yield taskResolver.run();


  const content = articleNode.toFinalHtml();
  log.debug(new Date() - d);
  return content;
};


module.exports = ArticleRenderer;
