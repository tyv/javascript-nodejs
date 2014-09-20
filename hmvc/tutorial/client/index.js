require('client/polyfill');
var delegate = require('client/delegate');
var prism = require('client/prism');
var findClosest = require('client/dom/findClosest');

exports.init = function() {

  initTaskButtons();
  prism();
};


function initTaskButtons() {
  // solution button
  delegate(document.body, '.tasks__solution', 'click', function(event) {
    findClosest(event.target, '.tasks__task').classList.toggle('tasks__task_answer_open');
  });

  // close solution button
  delegate(document.body, '.tasks__answer-close', 'click', function(event) {
    findClosest(event.target, '.tasks__task').classList.toggle('tasks__task_answer_open');
  });

  // every step button (if any steps)
  delegate(document.body, '.tasks__step-show', 'click', function(event) {
    findClosest(event.target, '.tasks__step').classList.toggle('tasks__step_open');
  });
}
