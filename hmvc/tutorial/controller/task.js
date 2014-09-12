const mongoose = require('mongoose');
const Task = require('../models/task');
const TaskRenderer = require('../renderer/taskRenderer');

exports.get = function *get(next) {
  const task = yield Task.findOne({
    slug: this.params.slug
  }).exec();

  if (!task) {
    yield next;
    return;
  }

  const renderer = new TaskRenderer();

  
  this.body = yield renderer.renderContent(task);

};

