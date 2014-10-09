require('client/polyfill');
var delegate = require('client/delegate');
var prism = require('client/prism');
var findClosest = require('client/dom/findClosest');
var xhr = require('client/xhr');
var TutorialMapModal = require('./tutorialMapModal');

exports.init = function() {

  initTaskButtons();

  delegate(document, '[data-action="tutorial-map"]', 'click', function(event) {
    new TutorialMapModal();
    event.preventDefault();
  });

  prism();
};

exports.TutorialMap = require('./tutorialMap');

function initTaskButtons() {
  // solution button
  delegate(document, '.task__solution', 'click', function(event) {
    findClosest(event.target, '.task').classList.toggle('task__answer_open');
  });

  // close solution button
  delegate(document, '.task__answer-close', 'click', function(event) {
    findClosest(event.target, '.task').classList.toggle('task__answer_open');
  });

  // every step button (if any steps)
  delegate(document, '.task__step-show', 'click', function(event) {
    findClosest(event.target, '.task__step').classList.toggle('task__step_open');
  });
}
