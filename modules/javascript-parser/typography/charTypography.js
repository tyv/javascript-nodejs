/**
 Типографер для замены символов и спецпоследовательностей,
 работает точечно,
 (возможно нужно запускать до jsdom, так как некоторые последовательности типа -> <- могут ему не понравиться)
*/

var PUNCT_REG = /[!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]/;

function escapeReg(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

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
  html = processPlusmin(html);
  html = processArrows(html);
  html = processLoneLt(html);
  html = processCopymarks(html);
  html = processHellip(html);
  html = processDash(html);
  html = processEmdash(html);
  return html;
}

module.exports = charTypography;
