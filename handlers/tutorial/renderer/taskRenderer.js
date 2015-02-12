const HeaderTag = require('simpledownParser').HeaderTag;
const BodyParser = require('simpledownParser').BodyParser;
const ServerHtmlTransformer = require('serverHtmlTransformer');
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

TaskRenderer.prototype.renderContent = function* (task, options) {

  options = Object.create(options);
  options.metadata = this.metadata;
  options.trusted = true;

  const node = new BodyParser(task.content, options).parseAndWrap();

  node.removeChild(node.getChild(0));

  const transformer = new ServerHtmlTransformer({
    resourceWebRoot: task.getResourceWebRoot(),
    staticHost:      config.server.staticHost,
    isEbook:         options.isEbook
  });

  var content = yield* transformer.transform(node, true);

  content = yield* this.addContentPlunkLink(task, content);
  return content;
};


TaskRenderer.prototype.addContentPlunkLink = function*(task, content) {

  var sourcePlunk = yield Plunk.findOne({webPath: task.getResourceWebRoot() + '/source'}).exec();

  if (sourcePlunk) {

    var files = sourcePlunk.files.toObject();
    var hasTest = false;
    for (var i = 0; i < files.length; i++) {
      if (files[i].filename == 'test.js') hasTest = true;
    }

    var title = hasTest ?
      'Открыть песочницу с тестами для задачи.' :
      'Открыть песочницу для задачи.';


    content += '<a href="' + sourcePlunk.getUrl() + '" data-plunk-id="' + sourcePlunk.plunkId + '">' + title + '</a>';
  }

  return content;
};

TaskRenderer.prototype.render = function*(task, options) {

  this.content = yield* this.renderContent(task, options);
  this.solution = yield* this.renderSolution(task, options);

  return {
    content:  this.content,
    solution: this.solution
  };
};

TaskRenderer.prototype.renderWithCache = function*(task, options) {
  options = options || {};

  var useCache = !options.refreshCache && config.renderedCacheEnabled;

  if (task.rendered && useCache) return task.rendered;

  var rendered = yield* this.render(task, options);

  task.rendered = rendered;

  yield task.persist();

  return rendered;
};


TaskRenderer.prototype.renderSolution = function* (task, options) {

  options = Object.create(options);
  options.metadata = this.metadata;
  options.trusted = true;

  const node = new BodyParser(task.solution, options).parseAndWrap();

  var children = node.getChildren();

  const transformer = new ServerHtmlTransformer({
    resourceWebRoot: task.getResourceWebRoot(),
    staticHost:      config.server.staticHost,
    isEbook:         options.isEbook
  });

  const solutionParts = [];

// if no #header at start
// no parts, single solution
  if (!(children[0] instanceof HeaderTag)) {
    var solution = yield* transformer.transform(node, true);
    solution = yield* this.addSolutionPlunkLink(task, solution);
    return solution;
  }

// otherwise, split into parts
  var currentPart;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child instanceof HeaderTag) {
      currentPart = {title: stripTags(yield transformer.transform(child, true)), content: []};
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
  solutionParts[solutionParts.length - 1].content = yield* this.addSolutionPlunkLink(task, solutionPartLast.content);

  return solutionParts;
}
;

TaskRenderer.prototype.addSolutionPlunkLink = function*(task, solution) {

  var solutionPlunk = yield Plunk.findOne({webPath: task.getResourceWebRoot() + '/solution'}).exec();

  if (solutionPlunk) {
    var files = solutionPlunk.files.toObject();
    var hasTest = false;
    for (var i = 0; i < files.length; i++) {
      if (files[i].filename == 'test.js') hasTest = true;
    }

    var title = hasTest ?
      'Открыть решение с тестами в песочнице.' :
      'Открыть решение в песочнице';

    solution += '<a href="' + solutionPlunk.getUrl() + '" data-plunk-id="' + solutionPlunk.plunkId + '">' + title + '</a>';

  }

  return solution;
};

function stripTags(text) {
  return text.replace(/<\/?[a-z].*?>/gim, '');
}

module.exports = TaskRenderer;
