var delegate = require('client/delegate');
var xhr = require('client/xhr');
var notify = require('client/notify');
var Spinner = require('client/spinner');

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


  onDisplayNameSubmit(event) {
    var form = event.delegateTarget;
    var input = form.elements.displayName;
    var value = input.value;
    if (!value) {
      notify.error("Отсутствует значение.");
      return;
    }
    var request = this.createRequest(form, new FormData(form));


    request.addEventListener('success', (event) => {

      if (this.status == 200) {
        notify.success("Сохранено. Изменение будет видно после перезагрузки страницы.");
      } else {
        notify.error("Ошибка");
      }

    });
  }


  createRequest(indicatorElem, body) {

    var request = xhr({
      method: 'PATCH',
      url:    '/users/me',
      body: body
    });

    request.addEventListener('loadstart', () => {
      var onEnd = this.startRequestIndication(indicatorElem);
      request.addEventListener('loadend', onEnd);
    });


  }

  startRequestIndication(elem) {

    var spinner = new Spinner({
        elem:      elem,
        size:      'small',
        class:     'submit-button__spinner',
        elemClass: 'submit-button_progress'
    });
    spinner.start();

    return function onEnd() {
      spinner.stop();
    };
  }


}

delegate.delegateMixin(ProfileEditor.prototype);

export default ProfileEditor;