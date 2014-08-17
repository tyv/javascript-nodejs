var mailer = require('mailer');
var config = require('config');

module.exports = function* (email, verifyEmailToken, context) {
  var letter = context.render('verify-email', {link: config.siteurl + '/auth/verify/' + verifyEmailToken});

  yield mailer.sendMail({
    to:      email,
    subject: "Подтверждение email",
    html:    letter
  });

};
