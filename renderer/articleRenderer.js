const HtmlTransformer = require('javascript-parser').HtmlTransformer;
const ReferenceResolver = require('./referenceResolver').ReferenceResolver;
const TaskResolver = require('./taskResolver').TaskResolver;
const BodyParser = require('javascript-parser').BodyParser;

/**
 * Can render many articles, keeping metadata
 * @constructor
 */
function ArticleRenderer() {
  this.metadata = {};
}

ArticleRenderer.prototype.render = function* (article) {

  const options = {
    resourceFsRoot:  article.getResourceFsRoot(),
    resourceWebRoot: article.getResourceWebRoot(),
    metadata:        this.metadata,
    trusted:         true
  };

  // shift off the title header
  const articleNode = yield new BodyParser(article.get('content'), options).parseAndWrap();
  articleNode.removeChild(articleNode.getChild(0));

  const referenceResolver = new ReferenceResolver(articleNode);
  yield referenceResolver.run();

  const taskResolver = new TaskResolver(articleNode);
  yield taskResolver.run();

  const transformer = new HtmlTransformer(articleNode, options);
  const content = yield transformer.run();
  return content;
};


exports.ArticleRenderer = ArticleRenderer;