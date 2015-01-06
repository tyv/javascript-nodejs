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

Prism.tokenTag = 'code'; // for iBooks to use monospace font

var CodeBox = require('./codeBox');
var CodeTabsBox = require('./codeTabsBox');

function initCodeBoxes() {

  // highlight inline
  var codeExampleElems = document.getElementsByClassName('code-example');

  for (var i = 0; i < codeExampleElems.length; i++) {
    var codeExampleElem = codeExampleElems[i];
    new CodeBox(codeExampleElem);
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
    initCodeTabsBox();
  });

};

