
var clientRender = require('client/clientRender');
var template = require('./iframeBox.jade');
var iframeResize = require('./iframeResize');

function IframeBox(iframe) {


  var locals = { };

  if (iframe.dataset.external) {
    locals.external = {
      href: iframe.getAttribute('src')
    };
  }


  if (iframe.dataset.play) {
    locals.edit = {
      href: 'http://plnkr.co/edit/' + iframe.dataset.play + '?p=preview'
    };
  }


  if (iframe.dataset.zip) {
    locals.zip = {
      href: '/zip' + iframe.getAttribute('src')
    };
  }

  var rendered = clientRender(template, locals);
  iframe.insertAdjacentHTML("afterEnd", rendered);
  var elem = iframe.nextSibling;

  elem.querySelector("[data-result]").appendChild(iframe);


  if (iframe.dataset.demoHeight) {
    var height = +iframe.dataset.demoHeight;
    if (!iframe.dataset.trusted) height = Math.min(height, 800);
    iframe.style.height = height + 'px';
  } else {
    iframe.onload = function() {
      iframeResize(iframe, function(err) {
        if (err) iframe.style.height = '100px';
      });
    };
  }

  if (iframe.dataset.playError) {
    elem.insertAdjacentHTML("afterBegin", '<div class="format_error">' + esc(iframe.dataset.playError) + '</div>');
  }
}


function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = IframeBox;
