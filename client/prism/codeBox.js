var template = require('./codeBox.jade');
var iframeResize = require('./iframeResize');
var isScrolledIntoView = require('client/isScrolledIntoView');
var clientRender = require('client/clientRender');

function CodeBox(pre) {
  var code = pre.code;

  var isJS = pre.classList.contains('language-javascript');
  var isHTML = pre.classList.contains('language-markup');
  var isTrusted = pre.dataset.trusted;
  var jsFrame;
  var htmlResult;
  var isFirstRun = true;

  var locals = {
    isJS: isJS,
    isHTML: isHTML,
    run: pre.dataset.run
  };

  var rendered = clientRender(template, locals);

  pre.insertAdjacentHTML("afterEnd", rendered);
  var elem = pre.nextSibling;
  elem.querySelector('[data-code]').appendChild(pre);

  if (!isJS && !isHTML) return;

  if (pre.dataset.run) {
    elem.querySelector('[data-action="run"]').onclick = function() {
      this.blur();
      run();
      return false;
    };

    elem.querySelector('[data-action="edit"]').onclick = function() {
      this.blur();
      edit();
      return false;
    };
  }

  if (pre.dataset.autorun) {
    setTimeout(run, 10);
  }

  function postJSFrame() {
    var win = jsFrame[0].contentWindow;
    if (typeof win.postMessage != 'function') {
      alert("Извините, запуск кода требует более современный браузер");
      return;
    }
    win.postMessage(code, 'http://ru.lookatcode.com/showjs');
  }

  function runHTML() {

    var hasHeight = false;
    var frame;

    if (htmlResult && pre.dataset.refresh) {
      htmlResult.remove();
      htmlResult = null;
    }

    if (!htmlResult) {
      frame = document.createElement('iframe');
      frame.name = 'frame-'+Math.random();
      frame.className = 'result__iframe';

      if (pre.dataset.demoHeight === "0") {
        frame.style.display = 'none';
        hasHeight = true;
      } else if (pre.dataset.demoHeight) {
        var height = +pre.dataset.demoHeight;
        if (!isTrusted) height = Math.min(height, 800);
        if (height) {
          frame.style.height = height + 'px';
          hasHeight = true;
        }
      }

      htmlResult = document.createElement('div');
      htmlResult.className = "result code-example__result";
      htmlResult.appendChild(frame);

      elem.appendChild(htmlResult);
    } else {
      frame = htmlResult.querySelector('iframe');
    }

    if (isTrusted) {
      var doc = frame.contentDocument || frame.contentWindow.document;

      doc.open();
      doc.write(normalizeHtml(code));
      doc.close();

      if (!hasHeight) {
        iframeResize(frame);
      }

      if (!(isFirstRun && pre.dataset.autorun)) {
        if (!isScrolledIntoView(htmlResult)) {
          htmlResult.scrollIntoView(false);
        }
      }

    } else {
      var form = document.createElement('form');
      form.style.display = 'none';
      form.method = 'POST';
      form.enctype = "application/x-www-form-urlencoded";
      form.action = "http://ru.lookatcode.com/showhtml";
      form.target = frame.name;

      var textarea = document.createElement('textarea');
      textarea.name = 'code';
      textarea.value = normalizeHtml(code);
      form.appendChild(textarea);

      frame.parentNode.insertBefore(form, frame.nextSibling);
      form.submit();
      form.remove();

      if (!(isFirstRun && pre.dataset.autorun)) {
        frame.onload = function() {

          if (!hasHeight) {
            iframeResize(frame);
          }

          if (!isScrolledIntoView(htmlResult)) {
            htmlResult.scrollIntoView(false);
          }
        };
      }
    }

  }

  function runJS() {

    if (isTrusted) {
      var evalFunc = window.execScript || function (code) {
        window["eval"].call(window, code);
      };

      try {
        evalFunc(code);
      } catch (e) {
        alert("Ошибка: " + e.message);
      }
    } else {

      if (pre.dataset.refresh && jsFrame) {
        jsFrame.remove();
        jsFrame = null;
      }

      if (!jsFrame) {
        // create iframe for js
        jsFrame = document.createElement('iframe');
        jsFrame.className = 'js-frame';
        jsFrame.src = 'http://ru.lookatcode.com/showjs';
        jsFrame.style.width = 0;
        jsFrame.style.height = 0;
        jsFrame.style.border = 'none';
        jsFrame.onload = function() {
          postJSFrame();
        };
        document.body.appendChild(jsFrame);
      } else {
        postJSFrame();
      }

    }
  }

  function edit() {

    var html;
    if (isHTML) {
      html = normalizeHtml(code);
    } else {
      var codeIndented = code.replace(/^/gim, '    ');
      html = '<!DOCTYPE html>\n<html>\n\n<body>\n  <script>\n'+codeIndented+'\n  </script>\n</body>\n\n</html>';
    }

    var form = document.createElement('form');
    form.action = "http://plnkr.co/edit/?p=preview";
    form.method = "POST";
    form.enctype = "multipart/form-data";
    form.target = "_blank";

    document.body.appendChild(form);

    var input = document.createElement('input');
    input.name = "files[index.html]";
    input.type = 'hidden';
    input.value = html;
    form.appendChild(input);

    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = "description";
    input.value = "Fork from " + window.location;
    form.appendChild(input);

    form.submit();
    form.remove();
  }


  function normalizeHtml() {
    var codeLc = code.toLowerCase();
    var hasBodyStart = codeLc.match('<body>');
    var hasBodyEnd = codeLc.match('</body>');
    var hasHtmlStart = codeLc.match('<html>');
    var hasHtmlEnd = codeLc.match('</html>');

    var hasDocType = codeLc.match(/^\s*<!doctype/);

    if (hasDocType) {
      return code;
    }

    var result = code;

    if (!hasHtmlStart) {
      result = '<html>\n' + result;
    }

    if (!hasHtmlEnd) {
      result = result + '\n</html>';
    }

    if (!hasBodyStart) {
      result = result.replace('<html>','<html>\n<head>\n  <meta charset="utf-8">\n</head><body>\n');
    }

    if (!hasBodyEnd) {
      result = result.replace('</html>','\n</body>\n</html>');
    }

    result = '<!DOCTYPE HTML>\n' + result;

    return result;
  }



  function run() {
    if (isJS) {
      runJS();
    } else {
      runHTML();
    }
    isFirstRun = false;
  }



}

module.exports = CodeBox;
