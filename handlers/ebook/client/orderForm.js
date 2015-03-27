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

    this.delegate('[data-order-payment-change]', 'click', function(e) {
      e.preventDefault();
      this.elem.querySelector('[data-order-form-step-payment]').style.display = 'block';
      this.elem.querySelector('[data-order-form-step-confirm]').style.display = 'none';
      this.elem.querySelector('[data-order-form-step-receipt]').style.display = 'none';
    });
  }

  onPaymentMethodClick(e) {

    var data = {
      paymentMethod: e.delegateTarget.value
    };

    if (window.orderNumber) {
      data.orderNumber = window.orderNumber;
    } else {
      var chooser = this.elem.querySelector('input[name="orderTemplate"]:checked');
      data.orderTemplate = chooser.value;
      data.amount = chooser.dataset.amount; // for stats
    }

    if (this.elem.elements.email) {
      if (!this.elem.elements.email.value) {
        window.ga('send', 'event', 'payment', 'checkout-no-email', 'ebook');
        window.metrika.reachGoal('CHECKOUT-NO-EMAIL', { product: 'ebook'});
        new notification.Error("Введите email.");
        this.elem.elements.email.focus();
        return;
      } else {
        data.email = this.elem.elements.email.value;
      }
    }

    // response status must be 200
    var request = xhr({
      method:         'POST',
      url:            '/payments/common/checkout',
      normalStatuses: [200, 403],
      body:           data
    });

    if (data.orderTemplate) {
      window.ga('ec:addProduct', {
        id:       'ebook',
        variant:  data.orderTemplate,
        price:    data.amount,
        quantity: 1
      });
    }

    window.ga('ec:setAction', 'checkout', {
      step: 1,
      option: data.paymentMethod
    });

    window.metrika.reachGoal('CHECKOUT', {
      product: 'ebook',
      method:  data.paymentMethod,
      price: data.amount
    });

    window.ga('send', 'event', 'payment', 'checkout', 'ebook');
    window.ga('send', 'event', 'payment', 'checkout-method-' + data.paymentMethod, 'ebook');

    var onEnd = this.startRequestIndication();

    request.addEventListener('success', function(event) {

      if (this.status == 403) {
        new notification.Error("<p>" + (event.result.description || event.result.message) + "</p><p>Пожалуйста, начните оформление заново.</p><p>Если вы считаете, что на сервере ошибка &mdash; свяжитесь со <a href='mailto:orders@javascript.ru'>службой поддержки</a>.</p>");
        onEnd();
        return;
      }

      var result = event.result;

      if (result.form) {
        // don't stop the spinner while submitting the form to the payment system!
        // (still in progress)

        window.ga('ec:setAction', 'purchase', {
          id: result.orderNumber
        });

        var container = document.createElement('div');
        container.hidden = true;
        container.innerHTML = result.form;
        document.body.appendChild(container);

        window.ga('send', 'event', 'payment', 'purchase', 'ebook', {
          hitCallback: function() {
            container.firstChild.submit();
          }
        });


        window.metrika.reachGoal('PURCHASE', {
          product: 'ebook',
          method:  data.paymentMethod,
          price: data.amount,
          number: result.orderNumber
        });


      } else {
        console.error(result);
        onEnd();
        new notification.Error("Ошибка на сервере, свяжитесь со <a href='mailto:orders@javascript.ru'>службой поддержки</a>.");
      }
    });

    request.addEventListener('fail', onEnd);
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
