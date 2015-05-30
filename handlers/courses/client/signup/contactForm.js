var delegate = require('client/delegate');

class ContactForm {
  constructor(options) {
    this.elem = options.elem;

    this.elems = {};
    [].forEach.call(this.elem.querySelectorAll('[data-elem]'), (el) => {
      this.elems[el.getAttribute('data-elem')] = el;
    });

    this.elem.onsubmit = this.onSubmit.bind(this);
  }

  focus() {
    this.elems.contactName.focus();
  }

  onSubmit(event) {
    event.preventDefault();

    this.elem.dispatchEvent(new CustomEvent('change', {
      detail: {
        name:  this.elems.contactName.value,
        phone: this.elems.contactPhone.value
      }
    }));

  }

}

module.exports = ContactForm;
