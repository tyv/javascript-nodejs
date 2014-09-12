const HeaderTag = require('javascript-parser').HeaderTag;
const BodyParser = require('javascript-parser').BodyParser;
const ServerHtmlTransformer = require('parser/serverHtmlTransformer');
const CompositeTag = require('javascript-parser').CompositeTag;
const config = require('config');

/**
 * Can render many articles, keeping metadata
 * @constructor
 */
function TaskRenderer() {
  this.metadata = {};
}

TaskRenderer.prototype.renderContent = function* (task) {

  const options = {
    resourceFsRoot:    task.getResourceFsRoot(),
    resourceWebRoot:   task.getResourceWebRoot(),
    staticHost:        config.staticHost,
    metadata:          this.metadata,
    trusted:           true
  };

  const node = new BodyParser(task.solution, options).parseAndWrap();

  node.removeChild(node.getChild(0));

  const transformer = new ServerHtmlTransformer();

  return yield transformer.transform(node, true);
};


TaskRenderer.prototype.renderSolution = function* (task) {

  const options = {
    resourceFsRoot:  task.getResourceFsRoot(),
    resourceWebRoot: task.getResourceWebRoot(),
    staticHost:      config.staticHost,
    metadata:        this.metadata,
    trusted:         true
  };

  const node = new BodyParser(task.solution, options).parseAndWrap();

  var children = node.getChildren();

  const transformer = new ServerHtmlTransformer();

  const solutionParts = [];
  if (children[0] instanceof HeaderTag) {
    // split into parts
    var currentPart;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child instanceof HeaderTag) {
        currentPart = { title: yield transformer.transform(child, true), content: [] };
        solutionParts.push(currentPart);
        continue;
      }

      currentPart.content.push(child);
    }
  } else {
    solutionParts.push({title: "", content: children});
  }

  for (var i = 0; i < solutionParts.length; i++) {
    var part = solutionParts[i];
    part.content = transformer.transform(new CompositeTag(null, part.content), true);
  }

  return solutionParts;
};


module.exports = TaskRenderer;
