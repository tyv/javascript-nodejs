/**
 Типографер для замены символов и спецпоследовательностей,
 работает точечно,
 (возможно нужно запускать до jsdom, так как некоторые последовательности типа -> <- могут ему не понравиться)
*/

var VERBATIM_TAGS = require('../consts').VERBATIM_TAGS;
var ATTRS_REG = require('../consts').ATTRS_REG;

function processCopymarks(text) {
  text = text.replace(/\([сСcC]\)(?=[^\.\,\;\:])/ig, '©');

  text = text.replace(/\(r\)/ig, '<sup>®</sup>');

  text = text.replace(/\(tm\)|\(тм\)/ig, '™');

  text = text.replace(/\(p\)/ig, '℗');

  return text;
}

function processHellip(text) {
  return text.replace(/\.\.\./g, '…');
}

function processPlusmin(text) {
  return text.replace(/([^+])\+\-/gi, '$1±');
}

function processDash(text) {
  return text.replace(/(\s|;)\-(\s)/gi, '$1–$2');
}

function processEmdash(text) {
  return text.replace(/(\s|;)\-\-(\s)/gi, '$1—$2');
}

function processArrows(text) {
  return text.replace(/<-/gi, '←').replace(/(\s)->/gi, '$1→');
}

// ie < 10, ie<10 -> ie&lt;10
function processLoneLt(text) {
  return text.replace(/<(?=[\s\d])/gi, '&lt;');
}

function charTypography(html) {

  var noTypographyReg = new RegExp('<(' + VERBATIM_TAGS.join('|') + '|code|no-typography)' + ATTRS_REG.source + '>([\\s\\S]*?)</\\1>', 'gim');

  var labels = [];
  var label = ('' + Math.random()).slice(2);

  html = html.replace(noTypographyReg, function(match, tag, attrs, body) {
    labels.push(match);
    return tag == 'code' ? ('<span>' + label + '</span>') : ('<div>' + label + '</div>');
  });


  html = processPlusmin(html);
  html = processArrows(html);
  html = processLoneLt(html);
  html = processCopymarks(html);
  html = processHellip(html);
  html = processDash(html);
  html = processEmdash(html);

  var i = 0;
  html = html.replace(new RegExp('<(div|span)>'+label+'</\\1>', 'gm'), function() {
    return labels[i++];
  });

  return html;
}

module.exports = charTypography;
