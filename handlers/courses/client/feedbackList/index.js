var xhr = require('client/xhr');
var FeedbackLoader = require('../lib/feedbackLoader');
var pluralize = require('textUtil/pluralize');

function init() {
  let loader = new FeedbackLoader(window.FEEDBACK_LIST_INIT);

  let countElem = document.querySelector('[data-feedback-count]');

  loader.elem.addEventListener('feedbackChange', function(event) {
    countElem.hidden = false;

    countElem.children[0].innerHTML = event.detail.loader.total;
    countElem.children[1].innerHTML = pluralize(event.detail.loader.total, 'отзыв', 'отзыва', 'отзывов');
  });

  let teacherSelector = loader.elem.querySelector('[name="teacherId"]');

  teacherSelector.onchange = update;

  let starsSelector = loader.elem.querySelector('[name="stars"]');

  starsSelector.onchange = update;

  function update() {
    let filter = loader.filter;
    filter.teacherId = teacherSelector.value;
    filter.stars = starsSelector.value;
    loader.reset(filter);

    let activeStarsElem = document.querySelector('[data-stars-title].feedback-stat__item_active');
    if (activeStarsElem) {
      activeStarsElem.classList.remove('feedback-stat__item_active');
    }

    if (starsSelector.value) {
      document.querySelector(`[data-stars-title="${starsSelector.value}"]`).classList.add('feedback-stat__item_active');
    }
  }

}

init();
