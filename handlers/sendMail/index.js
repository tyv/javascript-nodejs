var mailer = require('mailer');
var config = require('config');
var fs = require('fs');
var path = require('path');
var thunkify = require('thunkify');

var logoBase64 = fs.readFileSync(path.join(config.projectRoot, 'assets/img/logo.png')).toString('base64');

// some clients don't allow svg
// var logoSrc = yield fs.readFile(path.join(config.projectRoot, 'assets/img/logo.svg'));

// TODO: rewrite from middleware to a module
// for onSuccess hook (not working now from onSuccess!)

// TODO: maybe refactor render into an independant render function and a middleware = render+ lookup
exports.init = function(app) {
  app.use(function*(next) {
    this.sendMail = sendMail;
    yield* next;
  });
};

function* sendMail(options) {

  options.logoBase64 = logoBase64;

  var letter = this.render(options.template, options);

  letter = yield mailer.inlineCss(letter);

  var info = yield thunkify(mailer.transport.sendMail.bind(mailer.transport))({
    to:      options.to,
    subject: options.subject,
    html:    letter
  });

  this.log.debug(info.envelope, letter);
}

