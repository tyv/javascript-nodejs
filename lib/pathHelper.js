const config = require('config');
const join = require('path').join;

/**
 * exports.articlePathHelper => resources are in article/, url is from root
 * exports.taskPathHelper => resources are in task/, url is from /task
 * @param resourceRoot
 * @param urlRoot
 * @constructor
 */
function PathHelper(resourceRoot, urlRoot) {
  if (!resourceRoot) {
    throw new Error("Must have resource root");
  }
  this.resourceRoot = join(config.publicPath, resourceRoot);
  this.urlRoot = urlRoot;
}

PathHelper.prototype.getResourcePathBySlug = function(slug) {
  return join(this.resourceRoot, slug);
};

PathHelper.prototype.getResourceWebRootBySlug = function(slug) {
  return '/' + this.resourceRoot + '/' + slug;
};

PathHelper.prototype.getUrlBySlug = function(slug) {
  return '/' + (this.urlRoot ? this.urlRoot + '/' : '') + slug;
};

PathHelper.prototype.getResourcePath = function(model) {
  return this.getResourcePathBySlug(model.get('slug'));
};

PathHelper.prototype.getResourceWebRoot = function(model) {
  return this.getResourceWebRootBySlug(model.get('slug'));
};

PathHelper.prototype.getUrl = function(model) {
  return this.getUrlBySlug(model.get('slug'));
};

exports.PathHelper = PathHelper;
exports.articlePathHelper = new PathHelper('article', '');
exports.taskPathHelper = new PathHelper('task', 'task');
