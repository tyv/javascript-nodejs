const mongoose = require('mongoose');
const Task = require('../models/task');
const TaskRenderer = require('../renderer/taskRenderer').TaskRenderer;

exports.get = function *get(next) {
  const task = yield Task.findOne({
    slug: this.params.slug
  }).exec();

  if (!task) {
    yield next;
    return;
  }

  const renderer = new TaskRenderer();
  // todo: implement this
  this.body = yield renderer.render(task);

};

