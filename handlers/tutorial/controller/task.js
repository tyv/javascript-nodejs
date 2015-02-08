const mongoose = require('mongoose');
const Task = require('../models/task');
const TaskRenderer = require('../renderer/taskRenderer');

exports.get = function *get(next) {

  const task = yield Task.findOne({
    slug: this.params.slug
  }).populate('parent', 'slug').exec();

  if (!task) {
    yield* next;
    return;
  }

  const renderer = new TaskRenderer();

  const rendered = yield* renderer.renderWithCache(task);

  this.locals.siteToolbarCurrentSection = "tutorial";

  this.locals.task = {
    title:      task.title,
    importance: task.importance,
    content:    rendered.content,
    solution:   rendered.solution
  };

  this.locals.articleUrl = task.parent.getUrl();

  this.body = this.render("task");
};

