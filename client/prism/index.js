require('prismjs/components/prism-core.js');
require('prismjs/components/prism-markup.js');
require('prismjs/components/prism-css.js');
require('prismjs/components/prism-css-extras.js');
require('prismjs/components/prism-clike.js');
require('prismjs/components/prism-javascript.js');
require('prismjs/components/prism-coffeescript.js');
require('prismjs/components/prism-http.js');
require('prismjs/components/prism-scss.js');
require('prismjs/components/prism-sql.js');
require('prismjs/components/prism-php.js');
require('prismjs/components/prism-php-extras.js');
require('prismjs/components/prism-python.js');
require('prismjs/components/prism-ruby.js');
require('prismjs/components/prism-java.js');

var CodeBox = require('./codeBox');
var IframeBox = require('./iframeBox');
var CodeTabsBox = require('./codeTabsBox');

function initCodeBoxes() {

  // highlight inline
  var codePreElems = document.querySelectorAll('pre[class*="language-"]');

  for (var i = 0; i < codePreElems.length; i++) {
    var codePreElem = codePreElems[i];

    // already highlighted
    if (codePreElem.code) continue;

    codePreElem.code = codePreElem.textContent;

    // wrap <pre>...</pre> content in <pre><code>...</code></pre>
    var codeElem = document.createElement('code');
    while(codePreElem.firstChild) {
      codeElem.appendChild(codePreElem.firstChild);
    }
    codePreElem.appendChild(codeElem);

    Prism.highlightElement(codeElem);

    addLineNumbers(codePreElem);
    addBlockHighlight(codePreElem);
    addInlineHighlight(codePreElem);
    new CodeBox(codePreElem);
  }

}


function addLineNumbers(pre) {

  var linesNum = (1 + pre.innerHTML.split('\n').length);
  var lineNumbersWrapper;

  var lines = new Array(linesNum);
  lines = lines.join('<span></span>');

  lineNumbersWrapper = document.createElement('span');
  lineNumbersWrapper.className = 'line-numbers-rows';
  lineNumbersWrapper.innerHTML = lines;

  if (pre.hasAttribute('data-start')) {
    pre.style.counterReset = 'linenumber ' + Number(pre.dataset.start) - 1;
  }

  pre.appendChild(lineNumbersWrapper);
}


function addBlockHighlight(pre) {

  var lines = pre.dataset.highlightBlock;

  if (!lines) {
    return;
  }

  var ranges = lines.replace(/\s+/g, '').split(',');

  /*jshint -W084 */
  for (var i = 0, range; range = ranges[i++];) {
    range = range.split('-');

    var start = +range[0],
        end = +range[1] || start;


    var mask = '<div class="block-highlight" data-start="'+start+'" data-end="'+end+'">' +
      new Array(start + 1).join('\n') +
      '<div class="mask">' + new Array(end - start + 2).join('\n') + '</div></div>';

    pre.insertAdjacentHTML("afterBegin", mask);
  }

}


function addInlineHighlight(pre) {
  var ranges = pre.dataset.highlightInline;

  var codeElem = pre.querySelector('code');

  ranges = ranges ? ranges.split(",") : [];

  for (var i = 0; i < ranges.length; i++) {
    var piece = ranges[i].split(':');
    var lineNum = +piece[0], strRange = piece[1].split('-');
    var start = +strRange[0], end = +strRange[1];
    var mask = '<div class="inline-highlight">' +
      new Array(lineNum + 1).join('\n') +
      new Array(start + 1).join(' ') +
      '<span class="mask">' + new Array(end - start + 1).join(' ') + '</span></div>';

    codeElem.insertAdjacentHTML("afterBegin", mask);
  }
}

function initIframeBoxes() {

  var iframeResultElems = document.querySelectorAll('iframe.result__iframe');

  for (var i = 0; i < iframeResultElems.length; i++) {
    var iframeElem = iframeResultElems[i];
    new IframeBox(iframeElem);
  }

}

function initCodeTabsBox() {

  var elems = document.querySelectorAll('div.code-tabs');

  for (var i = 0; i < elems.length; i++) {
    new CodeTabsBox(elems[i]);
  }

}

module.exports = function () {
  document.removeEventListener('DOMContentLoaded', Prism.highlightAll);

  document.addEventListener('DOMContentLoaded', function() {
    initCodeBoxes();
    initIframeBoxes();
    initCodeTabsBox();
  });

};

