var contextTypography = require('./contextTypography');
var charTypography = require('./charTypography');

module.exports = function(title) {
  return contextTypography(charTypography(title), {noParagraphs: true});
};

