var stylus = require('stylus');
var fs = require('fs');
var projectRoot = require('config').projectRoot;
var inlineContent = require('juice2').inlineContent;
var path = require('path');

var mailCss = (function() {
  var mailStyl = fs.readFileSync(path.join(projectRoot ,'styles', 'mail.styl'), 'utf-8');
  return stylus.render(mailStyl, {use: [require('nib')()]});
}());

module.exports = function(html) {
  return inlineContent(html, mailCss);
};
