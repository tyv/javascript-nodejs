var xhr = require('client/xhr');
var notification = require('client/notification');
var delegate = require('client/delegate');
var Spinner = require('client/spinner');


class OrderForm {


  constructor(options) {
    this.elem = options.elem;

    this.elem.addEventListener('submit', (e) => e.preventDefault());

    // many buttons with paymentMethods, onSubmit doesn't give a way to learn which one is pressed
    // so I listen to onclick
    this.delegate('[name="paymentMethod"]', 'click', (e) => this.onPaymentMethodClick(e));
  }

  onPaymentMethodClick(e) {

    // response status must be 200
    var request = this.request({
      method: 'POST',
      url:    '/getpdf/checkout',
      body:   {
        orderNumber:   window.orderNumber,
        orderTemplate: window.orderTemplate,
        email:         this.elem.elements.email.value,
        paymentMethod: e.delegateTarget.value
      }
    });

    request.addEventListener('success', function(event) {
      var result = event.result;

      if (result.form) {
        var container = document.createElement('div');
        container.hidden = true;
        container.innerHTML = result.form;
        document.body.appendChild(container);
        container.firstChild.submit();
      } else {
        new notification.Error("Ошибка на сервере, свяжитесь со <a href='mailto:mk@javascript.ru'>службой поддержки</a>.");
      }
    });
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
