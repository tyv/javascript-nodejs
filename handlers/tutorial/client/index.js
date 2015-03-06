var delegate = require('client/delegate');
var prism = require('client/prism');
var xhr = require('client/xhr');
var TutorialMapModal = require('./tutorialMapModal');

exports.init = function() {

  initTaskButtons();
  initFolderList();

  initSidebarHighlight();

  delegate(document, '[data-action="tutorial-map"]', 'click', function(event) {
    new TutorialMapModal();
    event.preventDefault();
  });

  prism.init();

  if (window.isEbook) {
    require.ensure('./ebook', function() {
      require('./ebook').init();
    }, 'ebook');
  }
};

exports.TutorialMap = require('./tutorialMap');

function initSidebarHighlight() {

  function highlight() {

    var current = document.getElementsByClassName('sidebar__navigation-link_active');
    if (current[0]) current[0].classList.remove('sidebar__navigation-link_active');

    var h2s = document.getElementsByTagName('h2');
    for (var i = 0; i < h2s.length; i++) {
      var h2 = h2s[i];
      // first in-page header
      if (h2.getBoundingClientRect().top > 0) break;
    }
    i--; // we need the one before it (currently reading)

    if (i>=0) {
      var href = h2s[i].firstElementChild && h2s[i].firstElementChild.getAttribute('href');
      var li = document.querySelector('.sidebar__navigation-link a[href="' + href + '"]');
      if (href && li) {
        li.classList.add('sidebar__navigation-link_active');
      }
    }

  }

  document.addEventListener('DOMContentLoaded', function() {
    highlight();

    window.addEventListener('scroll', highlight);
  });


}


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

//window.tutorial = module.exports;