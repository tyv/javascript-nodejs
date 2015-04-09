var xhr = require('client/xhr');
var notification = require('client/notification');
var delegate = require('client/delegate');
var FormPayment = require('payments/common/client').FormPayment;
var Spinner = require('client/spinner');
var Modal = require('client/head/modal');

class OrderForm {

  constructor(options) {
    this.elem = options.elem;

    this.product = 'ebook';

    this.elem.addEventListener('submit', (e) => e.preventDefault());

    // many buttons with paymentMethods, onSubmit doesn't give a way to learn which one is pressed
    // so I listen to onclick
    this.delegate('[name="paymentMethod"]', 'click', (e) => this.onPaymentMethodClick(e));

    this.delegate('[data-order-payment-change]', 'click', function(e) {
      e.preventDefault();
      this.elem.querySelector('[data-order-form-step-payment]').style.display = 'block';
      this.elem.querySelector('[data-order-form-step-confirm]').style.display = 'none';
      this.elem.querySelector('[data-order-form-step-receipt]').style.display = 'none';
    });

    this.delegate('.complex-form__extract .extract__item', 'click', function(e) {
      e.delegateTarget.querySelector('[type="radio"]').checked = true;
    });
  }

  // return orderData or nothing if validation failed
  getOrderData() {
    var orderData = {    };

    if (window.orderNumber) {
      orderData.orderNumber = window.orderNumber;
    } else {
      var chooser = this.elem.querySelector('input[name="orderTemplate"]:checked');
      orderData.orderTemplate = chooser.value;
      orderData.amount = chooser.dataset.amount; // for stats
    }

    if (this.elem.elements.email) {
      if (!this.elem.elements.email.value) {
        window.ga('send', 'event', 'payment', 'checkout-no-email', 'ebook');
        window.metrika.reachGoal('CHECKOUT-NO-EMAIL', {product: 'ebook'});
        new notification.Error("Введите email.");
        this.elem.elements.email.focus();
        return;
      } else {
        orderData.email = this.elem.elements.email.value;
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


delegate.delegateMixin(OrderForm.prototype);

module.exports = OrderForm;
