var delegate = require('client/delegate');
var participantsItem = require('../../templates/blocks/participantsItem.jade');
var notification = require('client/notification');

var clientRender = require('client/clientRender');

class ParticipantsForm {
  constructor(options) {
    this.elem = options.elem;

    this.elems = {};
    [].forEach.call(this.elem.querySelectorAll('[data-elem]'), (el) => {
      this.elems[el.getAttribute('data-elem')] = el;
    });

    this.elem.onsubmit = this.onSubmit.bind(this);

    this.elems.participantsDecreaseButton.onclick = this.onParticipantsDecreaseButtonClick.bind(this);
    this.elems.participantsDecreaseButton.onmousedown = () => { return false; };
    this.elems.participantsIncreaseButton.onclick = this.onParticipantsIncreaseButtonClick.bind(this);
    this.elems.participantsIncreaseButton.onmousedown = () => { return false; };

    this.elems.participantsCountInput.onkeydown = (e) => {
      // Enter does not submit the form
      if (e.keyCode == 13 && e.target.tagName == 'INPUT') {
        e.preventDefault();
        e.target.blur();
      }
    };

    this.elems.participantsCountInput.onchange = this.onParticipantsCountInputChange.bind(this);
    this.elems.participantsIsSelf.onchange = this.onParticipantsIsSelfChange.bind(this);

    this.elems.participantsAddList.onchange = (e) => {
      this.validateParticipantItemInput(e.target);
    };


    this.elems.participantsAddList.onkeydown = (e) => {
      // Enter does not submit the form
      if (e.keyCode == 13  && e.target.tagName == 'INPUT') {
        e.preventDefault();
        e.target.blur();
      }
    };

  }

  validateParticipantItemInput(input) {
    var valid = /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(input.value);
    if (valid) {
      input.parentNode.classList.remove('text-input_invalid');
    } else {
      input.parentNode.classList.add('text-input_invalid');
    }
  }


  onParticipantsDecreaseButtonClick(event) {
    this.setCount(this.elems.participantsCountInput.value - 1);
  }

  onParticipantsIncreaseButtonClick(event) {
    this.setCount(+this.elems.participantsCountInput.value + 1);
  }

  onParticipantsCountInputChange(event) {
    this.setCount(this.elems.participantsCountInput.value);
  }

  onParticipantsIsSelfChange(event) {
    this.setCount(this.elems.participantsCountInput.value);
  }

  setCount(count) {
    count = parseInt(count) || 0;

    var max = +this.elems.participantsCountInput.getAttribute('max');
    this.elems.participantsDecreaseButton.disabled = (count <= 1);
    this.elems.participantsIncreaseButton.disabled = (count >= max);

    this.elems.participantsCountInput.value = count;

    var invalid = count < 1 || count > max;
    if (invalid) {
      this.elems.participantsCountInput.parentNode.classList.add('text-input_invalid');
      return;
    }

    // render price
    this.elems.participantsAmount.innerHTML = window.groupInfo.price * count;
    this.elems.participantsAmountUsd.innerHTML = Math.round(window.groupInfo.price * count / window.rateUsdRub);
    this.elems.participantsCountInput.parentNode.classList.remove('text-input_invalid');

    // show/hide participants box
    if (!this.elems.participantsIsSelf.checked || count > 1) {
      this.elems.participantsAddBox.classList.add('course-add-participants_visible');
    } else {
      this.elems.participantsAddBox.classList.remove('course-add-participants_visible');
    }

    // add/remove participant items
    while(this.elems.participantsAddList.children.length > count) {
      this.elems.participantsAddList.lastElementChild.remove();
    }

    while(this.elems.participantsAddList.children.length < count) {
      var item = clientRender(participantsItem);
      this.elems.participantsAddList.insertAdjacentHTML("beforeEnd", item);
    }

    // current visitor is the first item
    let firstParticipantItem = this.elems.participantsAddList.firstElementChild.querySelector('input');

    if (this.elems.participantsIsSelf.checked) {
      firstParticipantItem.disabled = true;
      firstParticipantItem.value = window.currentUser.email;
    } else {
      firstParticipantItem.disabled = false;
      firstParticipantItem.value = '';
    }


  }

  onSubmit(event) {
    event.preventDefault();

    try {
      if (this.elems.participantsCountInput.parentNode.classList.contains('text-input_invalid')) {
        throw new InvalidError();
      }

      var count = +this.elems.participantsCountInput.value;

      var emails = [];
      if (this.elems.participantsListEnabled.checked) {
        [].forEach.call(this.elems.participantsAddList.querySelectorAll('input'), function(input) {
          if (!input.value) return;
          if (input.parentNode.classList.contains('text-input_invalid')) {
            throw new InvalidError();
          }
          emails.push(input.value);
        });
      } else {
        if (this.elems.participantsIsSelf.checked) {
          emails.push(window.currentUser.email);
        }
      }


      this.elem.dispatchEvent(new CustomEvent('select', {
        detail: {
          count:  count,
          emails: emails
        }
      }));


    } catch(e) {
      if (e instanceof InvalidError) {
        new notification.Error("Исправьте, пожалуйста, ошибки.");
      } else {
        throw e;
      }

    }
  }

}

function InvalidError(message) {
  this.name = "InvalidError";
  this.message = message;
}

InvalidError.prototype = Object.create(Error.prototype);
InvalidError.prototype.constructor = InvalidError;


delegate.delegateMixin(ParticipantsForm.prototype);

module.exports = ParticipantsForm;
