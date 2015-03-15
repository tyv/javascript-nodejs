var mailer = require('mailer');
var config = require('config');
var fs = require('fs');
var path = require('path');
var thunkify = require('thunkify');
var _ = require('lodash');
var jade = require('lib/serverJade');
var logoBase64 = fs.readFileSync(path.join(config.projectRoot, 'assets/img/logo.png')).toString('base64');
var log = require('log')();

// some clients don't allow svg
// var logoSrc = yield fs.readFile(path.join(config.projectRoot, 'assets/img/logo.svg'));

// not middleware, cause can be used in CRON-based runs, from onPaid callback
// mail can be sent outside of request context
module.exports = function* sendMail(options) {

  var sender = config.mailer.senders[options.from || 'default'];
  if (!sender) {
    throw new Error("Unknown sender:" + options.from);
  }

  var locals = Object.create(options);
  _.assign(locals, config.jade);

  locals.logoBase64 = logoBase64;
  locals.signature = sender.signature;

  var templatePath = options.templatePath;
  if (!templatePath.endsWith('.jade')) templatePath += '.jade';

  var letter = jade.renderFile(templatePath, locals);

  letter = yield mailer.inlineCss(letter);

  locals.html = letter;
  locals.from = sender.from;

  var sendMailMethod = mailer.transport.sendMail.bind(mailer.transport);

  var info = yield thunkify(sendMailMethod)(locals);

  log.debug(info.envelope, letter);

};

