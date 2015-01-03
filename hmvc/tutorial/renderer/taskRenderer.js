const HeaderTag = require('simpledownParser').HeaderTag;
const BodyParser = require('simpledownParser').BodyParser;
const ServerHtmlTransformer = require('parser/serverHtmlTransformer');
const CompositeTag = require('simpledownParser').CompositeTag;
const config = require('config');
const Plunk = require('plunk').Plunk;

/**
 * Can render many articles, keeping metadata
 * @constructor
 */
function TaskRenderer() {
  this.metadata = {};
}

TaskRenderer.prototype.renderContent = function* (task) {

  const options = {
    metadata:          this.metadata,
    trusted:           true
  };

  const node = new BodyParser(task.content, options).parseAndWrap();

  node.removeChild(node.getChild(0));

  const transformer = new ServerHtmlTransformer({
    resourceWebRoot:   task.getResourceWebRoot(),
    staticHost:        config.server.staticHost
  });

  var content = yield* transformer.transform(node, true);

  content = yield* this.addContentPlunkLink(task, content);
  return content;
};


TaskRenderer.prototype.addContentPlunkLink = function*(task, content) {


  var sourcePlunk = yield Plunk.findOne({webPath: task.getResourceWebRoot() + '/source'}).exec();

  if (sourcePlunk) {

    var hasTest = sourcePlunk.files.toObject().find(function(item) {
      return item.filename == 'test.js';
    });

    var title = hasTest ?
      'Открыть песочницу с тестами для задачи.' :
      'Открыть песочницу для задачи.';


    content += '<a href="' + sourcePlunk.getUrl() + '" data-plunk-id="' + sourcePlunk.plunkId + '">' + title + '</a>';
  }

  return content;
};

TaskRenderer.prototype.render = function*(task) {

  this.content = yield* this.renderContent(task);
  this.solution = yield* this.renderSolution(task);

  return {
    content: this.content,
    solution: this.solution
  };
};

TaskRenderer.prototype.renderWithCache = function*(task, options) {
  options = options || {};

  if (task.rendered && !options.refreshCache) return task.rendered;

  var rendered = yield* this.render(task);

  task.rendered = rendered;

  yield task.persist();

  return rendered;
};


TaskRenderer.prototype.renderSolution = function* (task) {

  const options = {
    metadata:        this.metadata,
    trusted:         true
  };

  const node = new BodyParser(task.solution, options).parseAndWrap();

  var children = node.getChildren();

  const transformer = new ServerHtmlTransformer({
    resourceWebRoot:   task.getResourceWebRoot(),
    staticHost:        config.server.staticHost
  });

  const solutionParts = [];
  if (!(children[0] instanceof HeaderTag)) {
    var solution = yield* transformer.transform(node, true);
    solution = yield* this.addSolutionPlunkLink(task, solution);
    return solution;
  }

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

  for (var i = 0; i < solutionParts.length; i++) {
    var part = solutionParts[i];
    var child = new CompositeTag(null, part.content);
    child.trusted = node.trusted;
    part.content = yield* transformer.transform(child, true);
  }

  var solutionPartLast = solutionParts[solutionParts.length - 1];
  solutionParts[solutionParts.length - 1] = yield* this.addSolutionPlunkLink(task, solutionPartLast);

  return solutionParts;
};

TaskRenderer.prototype.addSolutionPlunkLink = function*(task, solution) {

  var solutionPlunk = yield Plunk.findOne({webPath: task.getResourceWebRoot() + '/solution'}).exec();

  if (solutionPlunk) {
    var hasTest = solutionPlunk.files.toObject().find(function(item) {
      return item.filename == 'test.js';
    });

    var title = hasTest ?
      'Открыть решение с тестами в песочнице.' :
      'Открыть решение в песочнице';

    solution += '<a href="' + solutionPlunk.getUrl() + '" data-plunk-id="' + solutionPlunk.plunkId + '">' + title + '</a>';

  }

  return solution;
};


module.exports = TaskRenderer;
