var xhr = require('client/xhr');

var delegate = require('client/delegate');
var Spinner = require('client/spinner');


class OrderForm {


  constructor(options) {
    this.elem = options.elem;

    this.elem.addEventListener('submit', (e) => this.onSubmit(e));
  }

  onSubmit(e) {
    e.preventDefault();

    // response status must be 200
    var request = this.request({
      method:          'POST',
      url:             '/getpdf/checkout',
      body:{
        orderNumber: window.orderNumber,
        orderTemplate: window.orderTemplate,
        email: this.elem.elements.email.value,
        paymentMethod: this.elem.elements.paymentMethod.value
      }
    });

    request.addEventListener('success', function(event) {
      // TODO
      // either html: what to show, if the result is clear
      // or form: form to submit (and leave the page)
      var result = event.result;
    });
/*
      .done(function(htmlForm) {
        $(htmlForm).submit();
      });*/
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
      elem:      paymentMethodElem,
      size:      'small'
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
