var delegate = require('client/delegate');
var xhr = require('client/xhr');
var notify = require('client/notify');

function ProfileEditor() {
  this.elem = document.body.querySelector('.profile__content');

  this.delegate('.profile__item_editable', 'click', function(event) {
    event.delegateTarget.classList.add('profile__item_editing');
  });


  document.addEventListener("DOMContentLoaded", function(e) {

    document.querySelector('.profile').addEventListener('click', function(e) {
      var elem;
      if (e.target.classList.contains('profile__item-cancel')) {
        elem = e.target;
        while (elem && !elem.classList.contains('profile__item_editable')) {
          elem = elem.parentNode;
        }
        elem.classList.remove('profile__item_editing');
      }
    })
  });


}

delegate.delegateMixin(PhotoChanger.prototype);

module.exports = PhotoChanger;
