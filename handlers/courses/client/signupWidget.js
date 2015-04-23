var xhr = require('client/xhr');
var notification = require('client/notification');
var delegate = require('client/delegate');
var FormPayment = require('payments/common/client').FormPayment;
var Spinner = require('client/spinner');
var Modal = require('client/head/modal');
var ParticipantsForm = require('./participantsForm');
var ContactForm = require('./contactForm');
var pluralize = require('textUtil/pluralize');

class SignupWidget {

  constructor(options) {
    this.elem = options.elem;

    this.product = 'course';

    this.elems = {};

    [].forEach.call(this.elem.querySelectorAll('[data-elem]'), (el) => {
      this.elems[el.getAttribute('data-elem')] = el;
    });

    if (this.elems.participants) {
      var participantsForm = new ParticipantsForm({
        elem: this.elems.participants
      });

      participantsForm.elem.addEventListener('select', this.onParticipantsFormSelect.bind(this));

      this.elems.receiptParticipantsEditLink.onclick = (e) => {
        e.preventDefault();
        this.goStep1();
      };
    }

    if (this.elems.contact) {

      var contactForm = this.contactForm = new ContactForm({
        elem: this.elems.contact
      });

      contactForm.elem.addEventListener('select', this.onContactFormSelect.bind(this));

      this.elems.receiptContactEditLink.onclick = (e) => {
        e.preventDefault();
        this.goStep2();
      };

    }

    this.elems.payment.onsubmit = this.onPaymentSubmit.bind(this);

    this.delegate('[data-order-payment-change]', 'click', (e) => {
      e.preventDefault();
      this.elem.className = this.elem.className.replace(/courses-register_step_\d/, '');
      this.elem.classList.add('courses-register_step_3');
    });


  }

  onPaymentSubmit() {
    event.preventDefault();
    new FormPayment(this, this.elem.querySelector('.pay-method')).submit();
  }

  goStep1() {
    this.elem.className = this.elem.className.replace(/courses-register_step_\d/, '');
    this.elem.classList.add('courses-register_step_1');
  }

  goStep2() {
    this.elem.className = this.elem.className.replace(/courses-register_step_\d/, '');
    this.elem.classList.add('courses-register_step_2');

    this.elems.receiptTitle.innerHTML = `Участие в курсе для ${this.participantsInfo.count}
      ${pluralize(this.participantsInfo.count, 'человека', 'человек', 'человек')}`;

    this.elems.receiptAmount.innerHTML = window.groupInfo.price * this.participantsInfo.count;

    this.contactForm.focus();
  }

  goStep3() {
    this.elem.className = this.elem.className.replace(/courses-register_step_\d/, '');
    this.elem.classList.add('courses-register_step_3');

    this.elems.receiptContactName.innerHTML = this.contactInfo.name;
    this.elems.receiptContactPhone.innerHTML = this.contactInfo.phone;
  }

  onParticipantsFormSelect(event) {
    this.participantsInfo = event.detail;
    this.goStep2();
  }

  onContactFormSelect(event) {
    this.contactInfo = event.detail;
    this.goStep3();
  }


  // return orderData or nothing if validation failed
  getOrderData() {

    var orderData = {    };

    if (window.orderNumber) {
      orderData.orderNumber = window.orderNumber;
    } else {
      orderData.slug = window.groupInfo.slug;
      orderData.orderTemplate = 'course';
      orderData.contactName = this.contactInfo.name;
      orderData.contactPhone = this.contactInfo.phone;
      orderData.count = this.participantsInfo.count;
      orderData.emails = this.participantsInfo.emails;
    }


    return orderData;
  }


  request(options) {
    var request = xhr(options);

    request.addEventListener('loadstart', function() {
      var onEnd = this.startRequestIndication();
      request.addEventListener('loadend', onEnd);
    }.bind(this));

    return request;
  }

  startRequestIndication() {

    var paymentMethodElem = this.elem.querySelector('.pay-method');
    paymentMethodElem.classList.add('modal-overlay_light');

    var spinner = new Spinner({
      elem:  paymentMethodElem,
      size:  'medium',
      class: 'pay-method__spinner'
    });
    spinner.start();

    return function onEnd() {
      paymentMethodElem.classList.remove('modal-overlay_light');
      if (spinner) spinner.stop();
    };

  }


}


delegate.delegateMixin(SignupWidget.prototype);

module.exports = SignupWidget;
