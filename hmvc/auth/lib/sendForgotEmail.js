var mailer = require('mailer');
var config = require('config');

module.exports = function* (email, token, context) {
  var letter = context.render('forgot-email', {link: config.siteHost + '/auth/forgot-recover/' + token});

  yield mailer.sendMail({
    to:      email,
    subject: "Восстановление доступа",
    html:    letter
  });

};
