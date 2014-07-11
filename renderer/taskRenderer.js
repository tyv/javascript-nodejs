const TreeWalker = require('javascript-parser').TreeWalker;
const HtmlTransformer = require('javascript-parser').HtmlTransformer;
const ReferenceResolver = require('./referenceResolver').ReferenceResolver;
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

  const referenceResolver = new ReferenceResolver(taskNode);
  yield referenceResolver.run();

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

  const referenceResolver = new ReferenceResolver(solutionNode);
  yield referenceResolver.run();

  const newChildren = new CompositeTag();

  var i = 0;
  var children = solutionNode.getChildren();

  var titleNodes;
  while (i < children.length) {
    var r = new CompositeTag();
    var child = children[i];
    if (child instanceof HeaderTag) {
      i++;
      titleNodes = child.getChildren();
    } else {
      titleNodes = [new TextNode("решение")];
    }

    var buttonHeader = new CompositeTag("u", titleNodes);
    r.appendChild(new CompositeTag("button"), [buttonHeader], {"class": "spoiler__button"});
    var spoilerContent = new CompositeTag('div', [], {"class": "spoiler__content"});

    while (i < children.length) {
      child = children[i];
      if (child instanceof HeaderTag) break;
      spoilerContent.appendChild(child);
      i++;
    }

    r.appendChild(spoilerContent);

//    var spoilerClass = this.options.export ? "spoiler" : "spoiler closed";
    var spoilerClass = "spoiler closed";
    newChildren.appendChild(new CompositeTag('div', [r], {"class": spoilerClass}));

  }

  const transformer = new HtmlTransformer(newChildren, options);
  const content = yield transformer.run();
  return content;
};


exports.TaskRenderer = TaskRenderer;