var delegate = require('client/delegate');
var prism = require('client/prism');
var xhr = require('client/xhr');
var TutorialMapModal = require('./tutorialMapModal');

exports.init = function() {

  initTaskButtons();
  initFolderList();

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
    event.target.closest('.task').classList.toggle('task__answer_open');
  });

  // close solution button
  delegate(document, '.task__answer-close', 'click', function(event) {
    event.target.closest('.task').classList.toggle('task__answer_open');
  });

  // every step button (if any steps)
  delegate(document, '.task__step-show', 'click', function(event) {
    event.target.closest('.task__step').classList.toggle('task__step_open');
  });
}

function initFolderList() {
  delegate(document, '.lessons-list__lesson_level_1 > .lessons-list__link', 'click', function(event) {
    var link = event.delegateTarget;
    var openFolder = link.closest('.lessons-list').querySelector('.lessons-list__lesson_open');
    // close the previous open folder (thus making an accordion)
    if (openFolder && openFolder != link.parentNode) {
      openFolder.classList.remove('lessons-list__lesson_open');
    }
    link.parentNode.classList.toggle('lessons-list__lesson_open');
    event.preventDefault();
  });
}

window.tutorial = module.exports;