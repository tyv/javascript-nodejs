require('./polyfill/dom4');

module.exports = xhr;

// Wrapper about XHR
// 1. triggers document.loadstart/loadend on communication start/end
// 2. triggers fail/success on load end:
//    --> status=500 means fail
//    --> fail event has .reason field
//    --> success event has .result field
function xhr(options) {

  var request = new XMLHttpRequest();
  request.open(options.method || 'GET', options.url, options.sync ? false : true);

  if (!options.noGlobalEvents) {
    request.addEventListener('loadstart', function(event) {
      var e = new CustomEvent('xhrstart');
      e.originalEvent = event;
      document.dispatchEvent(e);
    });
    request.addEventListener('success', function(event) {
      var e = new CustomEvent('xhrsuccess');
      e.result = event.result;
      e.originalEvent = event.originalEvent;
      document.dispatchEvent(e);
    });
    request.addEventListener('fail', function(event) {
      var e = new CustomEvent('xhrfail');
      e.reason = event.reason;
      e.originalEvent = event.originalEvent;
      document.dispatchEvent(e);
    });
  }

  if (options.json) {
    request.setRequestHeader("Accept", "application/json");
  }



  function fail(reason, originalEvent) {
    var e = new CustomEvent("fail");
    e.reason = reason;
    e.originalEvent = originalEvent;
    request.dispatchEvent(e);
  }

  function success(result, originalEvent) {
    var e = new CustomEvent('success');
    e.result = result;
    e.originalEvent = originalEvent;
    request.dispatchEvent(e);
  }

  request.addEventListener("error", function(e) {
    fail("Ошибка связи с сервером.", e);
  });

  request.addEventListener("timeout", function(e) {
    fail("Превышено максимально допустимое время ожидания ответа от сервера.", e);
  });

  request.addEventListener("abort", function(e) {
    fail("Запрос был прерван.", e);
  });

  request.addEventListener("load", function(e) {
    if (!this.status) { // does that ever happen?
      fail("Не получен ответ от сервера.", e);
      return;
    }

    if (this.status >= 500) {
      fail("Ошибка на стороне сервера, попытайтесь позднее.", e);
      return;
    }

    var result = this.responseText;
    var contentType = this.getResponseHeader("Content-Type");
    if (contentType.match(/^application\/json/) || options.json) {
      try {
        result = JSON.parse(result);
      } catch (e) {
        fail("Некорректный формат ответа от сервера", e);
        return;
      }
    }

    success(result, e);
  });

  return request;
}
