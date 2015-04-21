var xhr = require('client/xhr');
var notification = require('client/notification');
var delegate = require('client/delegate');
var FormPayment = require('payments/common/client').FormPayment;
var Spinner = require('client/spinner');
var Modal = require('client/head/modal');
var ParticipantsForm = require('./participantsForm');

class SignupWidget {

  constructor(options) {
    this.elem = options.elem;

    this.product = 'course';

    this.elems = {};
    [].forEach.call(this.elem.querySelectorAll('[data-elem]'), (el) => {
      this.elems[el.getAttribute('data-elem')] = el;
    });

    new ParticipantsForm({
      elem: this.elems.participants
    });

  }



  // return orderData or nothing if validation failed
  getOrderData() {
    var orderData = {    };

    if (this.elem.elements.email) {
      if (!this.elem.elements.email.value) {
        new notification.Error("Введите email.");
        this.elem.elements.email.scrollIntoView();
        setTimeout(function() {
          window.scrollBy(0, -200);
        }, 0);
        this.elem.elements.email.focus();
        return;
      } else {
        orderData.email = this.elem.elements.email.value;
      }
    }

    if (!this.elem.elements.invoiceNumber.value) {
      new notification.Error("Введите номер счета javascript.ru.");
      this.elem.elements.invoiceNumber.scrollIntoView();
      setTimeout(function() {
        window.scrollBy(0, -200);
      }, 0);
      this.elem.elements.invoiceNumber.focus();
      return;
    } else {
      orderData.invoiceNumber = this.elem.elements.invoiceNumber.value;
    }


    if (window.orderNumber) {
      orderData.orderNumber = window.orderNumber;
    } else {
      orderData.orderTemplate = 'invoice';
      orderData.amount = this.elem.elements.amount.value;

      if (!orderData.amount) {
        new notification.Error("Введите сумму.");
        this.elem.elements.amount.scrollIntoView();
        setTimeout(function() {
          window.scrollBy(0, -200);
        }, 0);
        this.elem.elements.amount.focus();
        return;
      }
    }


    return orderData;
  }

  onPaymentMethodClick(e) {
    var paymentMethod = e.delegateTarget.value;

    new FormPayment(paymentMethod, this).submit();
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
