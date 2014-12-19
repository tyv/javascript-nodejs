const mongoose = require('mongoose');
const Task = require('../models/task');
const TaskRenderer = require('../renderer/taskRenderer');
const Plunk = require('plunk').Plunk;

exports.get = function *get(next) {
  const task = yield Task.findOne({
    slug: this.params.slug
  }).populate('parent', 'slug').exec();

  if (!task) {
    yield* next;
    return;
  }

  const renderer = new TaskRenderer();

  this.locals.task = {
    title:      task.title,
    importance: task.importance,
    content:    yield renderer.renderContent(task),
    solution:   yield renderer.renderSolution(task)
  };

  this.locals.articleUrl = task.parent.getUrl();

  var sourcePlunk = yield Plunk.findOne({webPath: task.getResourceWebRoot() + '/source'}).exec();

  if (sourcePlunk) {
    this.locals.sourcePlunkInfo = {
      url: sourcePlunk.getUrl(),
      plunkId: sourcePlunk.plunkId
    };

    var hasTest = sourcePlunk.files.find(function(item) {
      return item.filename == 'test.js';
    });

    this.locals.sourcePlunkInfo.title = hasTest ?
      'Открыть песочницу с тестами для задачи.' :
      'Открыть песочницу для задачи.';

  }

  var solutionPlunk = yield Plunk.findOne({webPath: task.getResourceWebRoot() + '/solution'}).exec();
  if (solutionPlunk) {
    this.locals.solutionPlunkInfo = {
      url: solutionPlunk.getUrl(),
      plunkId: solutionPlunk.plunkId
    };

    var hasTest = solutionPlunk.files.find(function(item) {
      return item.filename == 'test.js';
    });

    this.locals.solutionPlunkInfo.title = hasTest ?
      'Открыть решение с тестами в песочнице.' :
      'Открыть решение в песочнице';
  }


  this.body = this.render("task");
};

