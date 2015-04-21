var delegate = require('client/delegate');
var participantsItem = require('../templates/blocks/participantsItem.jade');

var clientRender = require('client/clientRender');

class ParticipantsForm {
  constructor(options) {
    this.elem = options.elem;

    this.elems = {};
    [].forEach.call(this.elem.querySelectorAll('[data-elem]'), (el) => {
      this.elems[el.getAttribute('data-elem')] = el;
    });

    this.elems.participantsDecreaseButton.onclick = this.onParticipantsDecreaseButtonClick.bind(this);
    this.elems.participantsIncreaseButton.onclick = this.onParticipantsIncreaseButtonClick.bind(this);

    this.elems.participantsCountInput.onkeydown = (e) => {
      if (e.keyCode == 13) { // Enter
        e.preventDefault();
        this.blur();
      }
    };

    this.elems.participantsCountInput.onchange = this.onParticipantsCountInputChange.bind(this);
    this.elems.participantsIsSelf.onchange = this.onParticipantsIsSelfChange.bind(this);

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

    debugger;
    // add/remove participant items
    while(this.elems.participantsAddList.children.length > count) {
      this.elems.participantsAddList.lastElementChild.remove();
    }

    while(this.elems.participantsAddList.children.length < count) {
      var item = clientRender(participantsItem);
      this.elems.participantsAddList.insertAdjacentHTML("beforeEnd", item);
    }

    let firstParticipantItem = this.elems.participantsAddList.firstElementChild.querySelector('input');

    if (this.elems.participantsIsSelf.checked) {
      firstParticipantItem.disabled = true;
      firstParticipantItem.value = window.currentUser.email;
    } else {
      firstParticipantItem.disabled = false;
      firstParticipantItem.value = '';
    }


  }

}



delegate.delegateMixin(ParticipantsForm.prototype);

module.exports = ParticipantsForm;
