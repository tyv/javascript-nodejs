const HeaderTag = require('javascript-parser').HeaderTag;
const parseAndTransform = require('./parseAndTransform');
const CompositeTag = require('javascript-parser').CompositeTag;

/**
 * Can render many articles, keeping metadata
 * @constructor
 */
function TaskRenderer() {
  this.metadata = {};
}

TaskRenderer.prototype.renderContent = function* (task) {

  const options = {
    resourceFsRoot:  task.getResourceFsRoot(),
    resourceWebRoot: task.getResourceWebRoot(),
    metadata:        this.metadata,
    trusted:         true,
    removeFirstHeader: true
  };

  const node = yield parseAndTransform(task.content, options);
  return node.toFinalHtml();
};


TaskRenderer.prototype.renderSolution = function* (task) {

  const options = {
    resourceFsRoot:  task.getResourceFsRoot(),
    resourceWebRoot: task.getResourceWebRoot(),
    metadata:        this.metadata,
    trusted:         true
  };

  const node = yield parseAndTransform(task.solution, options);

  var children = node.getChildren();

  const solutionParts = [];
  if (children[0] instanceof HeaderTag) {
    // split into parts
    var currentPart;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child instanceof HeaderTag) {
        currentPart = { title: child.toFinalHtml(), content: [] };
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
    part.content = new CompositeTag(null, part.content).toFinalHtml();
  }

  return solutionParts;
};


module.exports = TaskRenderer;
