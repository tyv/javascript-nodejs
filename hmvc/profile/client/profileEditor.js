var delegate = require('client/delegate');
var xhr = require('client/xhr');
import notification from 'client/notification';
var Spinner = require('client/spinner');

class ProfileEditor {
  constructor() {
    this.elem = document.body.querySelector('.profile__content');

    this.delegate('.profile__item_editable', 'click', function(event) {
      event.delegateTarget.classList.add('profile__item_editing');
      var autofocus = event.delegateTarget.querySelector('[data-autofocus]');
      if (autofocus) autofocus.focus();
    });

    this.delegate('form[data-field="displayName"]', 'submit', this.onDisplayNameSubmit);

    this.delegate('.profile__item-cancel', 'click', function(event) {
      event.delegateTarget.closest('.profile__item_editable').classList.remove('profile__item_editing');
      event.delegateTarget.closest('.profile__item_editable').classList.remove('profile__item_editing');
    });
  }


  onDisplayNameSubmit(event) {
    event.preventDefault();
    var form = event.delegateTarget;
    var input = form.elements.displayName;
    var value = input.value;
    if (!value) {
      new notification.Error("Отсутствует значение.");
      return;
    }
    var request = this.sendForm(form);

    request.addEventListener('success', (event) => {

      if (request.status == 400) {
        input.closest('.text-input').classList.remove('text-input_invalid');
        new notification.Success("Сохранено. Изменение будет видно после перезагрузки страницы.");
      } else {
        input.closest('.text-input').classList.add('text-input_invalid');
        new notification.Error("Ошибка");
      }

    });

  }


  sendForm(form) {

    var request = xhr({
      method: 'PATCH',
      url:    '/users/me',
      body: body
    });

    request.addEventListener('loadstart', () => {
      var onEnd = this.startRequestIndication(indicatorElem);
      request.addEventListener('loadend', onEnd);
    });

    return request;
  }

  startRequestIndication(form) {
    elem.classList.add('modal-overlay');
    var spinner = new Spinner({
        elem:      elem,
        size:      'small',
        class:     'submit-button__spinner',
        elemClass: 'submit-button_progress'
    });
    spinner.start();

    return function onEnd() {
      elem.classList.remove('modal-overlay');
      spinner.stop();
    };
  }


}

delegate.delegateMixin(ProfileEditor.prototype);

export default ProfileEditor;