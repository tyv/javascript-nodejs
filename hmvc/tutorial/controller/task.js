const mongoose = require('mongoose');
const Task = require('../models/task');
const TaskRenderer = require('../renderer/taskRenderer');

exports.get = function *get(next) {
  const task = yield Task.findOne({
    slug: this.params.slug
  }).populate('parent', 'slug').exec();

  if (!task) {
    yield next;
    return;
  }

  const renderer = new TaskRenderer();

  this.locals.task = {
    url: task.getUrl(),
    title: task.title,
    importance: task.importance,
    content: yield renderer.renderContent(task),
    solution: yield renderer.renderSolution(task)
  };

  this.locals.articleUrl = task.parent.getUrl();

  this.body = this.render("task");
};

