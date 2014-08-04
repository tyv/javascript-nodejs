var stylus = require('stylus');
var fs = require('fs');
var inlineContent = require('juice2').inlineContent;

var mailCss = (function() {
  var mailStyl = fs.readFileSync(process.cwd() + '/app/stylesheets/mail.styl', 'utf-8');
  return stylus.render(mailStyl, {use: [require('nib')()]});
}());

module.exports = function(html) {
  return inlineContent(html, mailCss);
};
