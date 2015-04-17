var notification = require('client/notification');
var xhr = require('client/xhr');
var Spinner = require('client/spinner');
var Modal = require('client/head/modal');

/**
 * Get data from orderForm.getOrderData()
 * process payment, ask for more data if needed
 */
class FormPayment {

  constructor(orderForm, paymentMethodElem) {
    this.orderForm = orderForm;
    this.paymentMethodElem = paymentMethodElem;
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

    this.paymentMethodElem.classList.add('modal-overlay_light');

    var spinner = new Spinner({
      elem:  this.paymentMethodElem,
      size:  'medium',
      class: 'pay-method__spinner'
    });
    spinner.start();

    return () => {
      this.paymentMethodElem.classList.remove('modal-overlay_light');
      if (spinner) spinner.stop();
    };

  }

  readPaymentData() {
    var paymentData = {};

    [].forEach.call(this.paymentMethodElem.querySelectorAll('input,select,textarea'), function(elem) {
      if (elem.type == 'radio' && !elem.checked) return;
      paymentData[elem.name] = elem.value;
    });
    return paymentData;
  }

  submit() {

    var orderData = this.orderForm.getOrderData();
    if (!orderData) return;

    var paymentData = this.readPaymentData();

    if (!paymentData.paymentMethod) {
      new notification.Error("Выберите метод оплаты.");
      return;
    }

    for (var key in paymentData) {
      orderData[key] = paymentData[key];
    }

    // response status must be 200
    var request = xhr({
      method:         'POST',
      url:            '/payments/common/checkout',
      normalStatuses: [200, 403],
      body:           orderData
    });

    if (orderData.orderTemplate) {
      window.ga('ec:addProduct', {
        id:       this.orderForm.product,
        variant:  orderData.orderTemplate,
        price:    orderData.amount,
        quantity: 1
      });
    }

    window.ga('ec:setAction', 'checkout', {
      step:   1,
      option: orderData.paymentMethod
    });

    window.metrika.reachGoal('CHECKOUT', {
      product: this.orderForm.product,
      method:  orderData.paymentMethod,
      price:   orderData.amount
    });

    window.ga('send', 'event', 'payment', 'checkout', 'ebook');
    window.ga('send', 'event', 'payment', 'checkout-method-' + orderData.paymentMethod, this.orderForm.product);

    var onEnd = this.startRequestIndication();

    request.addEventListener('success', (event) => {

      if (request.status == 403) {
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


        // submit form after GA or after 500ms, which one comes sooner
        var submitForm = function() {
          if (!submitForm.called) {
            submitForm.called = true;
            container.firstChild.submit();
          }
        };

        window.ga('send', 'event', 'payment', 'purchase', 'ebook', {
          hitCallback: submitForm
        });
        setTimeout(submitForm, 500);


        window.metrika.reachGoal('PURCHASE', {
          product: this.orderForm.product,
          method:  orderData.paymentMethod,
          price:   orderData.amount,
          number:  result.orderNumber
        });


      } else {
        console.error(result);
        onEnd();
        new notification.Error("Ошибка на сервере, свяжитесь со <a href='mailto:orders@javascript.ru'>службой поддержки</a>.");
      }
    });

    request.addEventListener('fail', onEnd);
  }
}

module.exports = FormPayment;
