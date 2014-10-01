require('client/polyfill');
var delegate = require('client/delegate');
var prism = require('client/prism');
var findClosest = require('client/dom/findClosest');

exports.init = function() {

  initTaskButtons();
  prism();
};

exports.TutorialMap = require('./tutorialMap');

function initTaskButtons() {
  // solution button
  delegate(document.body, '.task__solution', 'click', function(event) {
    findClosest(event.target, '.task').classList.toggle('task__answer_open');
  });

  // close solution button
  delegate(document.body, '.task__answer-close', 'click', function(event) {
    findClosest(event.target, '.task').classList.toggle('task__answer_open');
  });

  // every step button (if any steps)
  delegate(document.body, '.task__step-show', 'click', function(event) {
    findClosest(event.target, '.task__step').classList.toggle('task__step_open');
  });
}
