const mongoose = require('mongoose');
const Task = mongoose.models.Task;
const TaskRenderer = require('../renderer/taskRenderer').TaskRenderer;

exports.get = function *get(next) {
  const task = yield Task.findOne({
    slug: this.params[0]
  }).exec();

  if (!task) {
    yield next;
    return;
  }

  const renderer = new TaskRenderer();
  // todo: implement this
  this.body = yield renderer.render(task);

};

