var mailer = require('mailer');
var config = require('config');
var fs = require('mz/fs');
var path = require('path');

module.exports = function* (email, token, context) {
  var logoSrc = yield fs.readFile(path.join(config.projectRoot, 'assets/img/logo.png'));
  //var logoSrc = yield fs.readFile(path.join(config.projectRoot, 'assets/img/logo.svg'));

  var letter = context.render('forgot-email', {
    link: config.server.siteHost + '/auth/forgot-recover/' + token,
    logoSrc: logoSrc.toString('base64')
  });

  var css = yield fs.readFile(path.join(config.projectRoot, 'templates', 'layouts', 'email.css'), 'utf-8');

  letter = yield mailer.inlineCss(letter);

  //console.log(letter);
  yield mailer.sendMail({
    to:      email,
    subject: "Восстановление доступа",
    html:    letter
  });

};
