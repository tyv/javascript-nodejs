var mailer = require('mailer');
var config = require('config');
var fs = require('fs');

module.exports = function* (email, token, context) {
  var letter = context.render('forgot-email', {link: config.siteHost + '/auth/forgot-recover/' + token});

  var css = fs.readFileSync('/js/javascript-nodejs/templates/layouts/email.css', 'utf-8');


  letter = yield mailer.inlineCss(letter);

  console.log(letter);
  yield mailer.sendMail({
    to:      email,
    subject: "Восстановление доступа",
    html:    letter
  });

};
