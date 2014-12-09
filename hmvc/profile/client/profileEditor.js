var delegate = require('client/delegate');
var xhr = require('client/xhr');
var notify = require('client/notify');

class ProfileEditor {
  constructor() {
    this.elem = document.body.querySelector('.profile__content');

    this.delegate('.profile__item_editable', 'click', function(event) {
      event.delegateTarget.classList.add('profile__item_editing');
      event.delegateTarget.querySelector('.control').focus();
    });

    this.delegate('form[data-field="displayName"]', 'submit', this.onDisplayNameSubmit);


    this.delegate('.profile__item-cancel', 'click', function(event) {
      event.delegateTarget.closest('.profile__item_editable').classList.remove('profile__item_editing');
      event.delegateTarget.closest('.profile__item_editable').classList.remove('profile__item_editing');
    });
  }

}

delegate.delegateMixin(ProfileEditor.prototype);

ProfileEditor.prototype.onDisplayNameSubmit = function(event) {
  var form = event.delegateTarget;
  var input = form.elements.displayName;
  var value = input.value;
  if (!value) {
    notify.error("Отсутствует значение.");
    return;
  }
  var request = this.createRequest(form, new FormData(form));
};

ProfileEditor.prototype.createRequest = function(indicatorElem, formData) {

  var request = xhr({
    method: 'PATCH',
    url:    '/users/me'
  });

  request.addEventListener('loadstart', function() {
    var onEnd = this.startRequestIndication(indicatorElem);
    request.addEventListener('loadend', onEnd);
  }.bind(this));

};

module.exports = ProfileEditor;
