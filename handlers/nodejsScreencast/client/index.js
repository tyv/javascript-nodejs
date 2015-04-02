var Modal = require('client/head/modal');
var courseForm = require('../templates/_course-form.jade');

exports.init = function() {
  initList();

  var link = document.querySelector('[data-nodejs-screencast-top-subscribe]');

  link.onclick = function(event) {
    var modal = new Modal();
    modal.setContent(courseForm());

    event.preventDefault();
  };

};

function initList() {
  var lis = document.querySelectorAll('li[mnemo]');

  for (var i = 0; i < lis.length; i++) {
    var li = lis[i];
    var mnemo = li.getAttribute('mnemo');

    li.insertAdjacentHTML(
      'beforeEnd',

      '<div class="lessons-list__download">' +
      '<div class="lessons-list__popup">' +
      '<ul class="lessons-list__popup-list">' +
      '<li class="lessons-list__popup-item">' +
      '<a href="/nodejs-screencast/nodejs-mp4-low/' +
      mnemo + '.mp4">Компактный размер</a>' +
      '</li>' +

      '<li class="lessons-list__popup-item">' +
      '<a href="/nodejs-screencast/nodejs-mp4/' +
      mnemo + '.mp4">Высокое качество</a>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>'
    );
  }
}


