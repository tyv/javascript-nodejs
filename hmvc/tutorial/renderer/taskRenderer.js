const TreeWalker = require('javascript-parser').TreeWalker;
const HtmlTransformer = require('javascript-parser').HtmlTransformer;
const ReferenceTransformer = require('parser/referenceTransformer').ReferenceTransformer;
const BodyParser = require('javascript-parser').BodyParser;
const TaskNode = require('javascript-parser').TaskNode;
const HeaderTag = require('javascript-parser').HeaderTag;
const TextNode = require('javascript-parser').TextNode;
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
    trusted:         true
  };

  // shift off the title header
  const taskNode = yield new BodyParser(task.content, options).parseAndWrap();
  taskNode.removeChild(taskNode.getChild(0));

  const referenceTransformer = new ReferenceTransformer(taskNode);
  yield referenceTransformer.run();

  const transformer = new HtmlTransformer(taskNode, options);
  const content = yield transformer.run();
  return content;
};


TaskRenderer.prototype.renderSolution = function* (task) {

  const options = {
    resourceFsRoot:  task.getResourceFsRoot(),
    resourceWebRoot: task.getResourceWebRoot(),
    metadata:        this.metadata,
    trusted:         true
  };

  // shift off the title header
  const solutionNode = yield new BodyParser(task.solution, options).parseAndWrap();

  const referenceTransformer = new ReferenceTransformer(solutionNode);
  yield referenceTransformer.run();

  const newChildren = new CompositeTag();

  var children = solutionNode.getChildren();

  const solutionParts = [];
  if (children[0] instanceof HeaderTag) {
    // split into parts
    var currentPart;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child instanceof HeaderTag) {
        currentPart = { title: yield new HtmlTransformer(child, options).run(), content: [] };
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
    part.content = yield new HtmlTransformer(part.content, options).run();
  }

  return solutionParts;
};


exports.TaskRenderer = TaskRenderer;
