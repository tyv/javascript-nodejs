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

    this.elem.addEventListener('submit', (e) => this.onSubmit(e));

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


  onSubmit(event) {
    event.preventDefault();
    new FormPayment(this, this.elem).submit();
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

    return orderData;
  }



}


delegate.delegateMixin(OrderForm.prototype);

module.exports = OrderForm;
