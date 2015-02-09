var mailer = require('mailer');
var config = require('config');
var fs = require('fs');
var path = require('path');
var thunkify = require('thunkify');
var _ = require('lodash');
var jade = require('jade');
var logoBase64 = fs.readFileSync(path.join(config.projectRoot, 'assets/img/logo.png')).toString('base64');
var log = require('log')();

// some clients don't allow svg
// var logoSrc = yield fs.readFile(path.join(config.projectRoot, 'assets/img/logo.svg'));

// TODO: rewrite from middleware to a module
// for onSuccess hook (not working now from onSuccess!)

// TODO: maybe refactor render into an independant render function and a middleware = render+ lookup
module.exports = function* sendMail(options) {

  var locals = Object.create(options);
  _.assign(locals, config.jade);
  locals.logoBase64 = logoBase64;

  var templatePath = options.templatePath;
  if (!templatePath.endsWith('.jade')) templatePath += '.jade';

  var letter = jade.renderFile(templatePath, locals);

  letter = yield mailer.inlineCss(letter);

  var info = yield thunkify(mailer.transport.sendMail.bind(mailer.transport))({
    to:      options.to,
    subject: options.subject,
    html:    letter
  });

  log.debug(info.envelope, letter);

};

