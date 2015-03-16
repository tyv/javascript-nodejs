var transport = require('./transport');
var inlineCss = require('./inlineCss');
var config = require('config');
var fs = require('fs');
var path = require('path');
var thunkify = require('thunkify');
var _ = require('lodash');
var jade = require('lib/serverJade');
var logoBase64 = fs.readFileSync(path.join(config.projectRoot, 'assets/img/logo.png')).toString('base64');
var log = require('log')();
var Letter = require('./models/letter');

// some clients don't allow svg
// var logoSrc = yield fs.readFile(path.join(config.projectRoot, 'assets/img/logo.svg'));

// not middleware, cause can be used in CRON-based runs, from onPaid callback
// mail can be sent outside of request context

/**
 * create & save a letter object
 * we save it to db to track delivery status
 *
 * Doesn't send the letter
 * Can use to send it letter
 * @param options
 * @returns {Letter}
 */
function* createLetter(options) {
  var letterData = {};

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

  var letterHtml = jade.renderFile(templatePath, locals);
  letterHtml = yield inlineCss(letterHtml);

  letterData.html = letterHtml;
  letterData.from = sender.from;

  ['subject', 'to', 'headers', 'attachments', 'newsletterRelease'].forEach(function(field) {
    if (options[field]) {
      letterData[field] = options[field];
    }
  });

  var letter = new Letter({
    data: letterData
  });

  yield letter.persist();

  return letter;
}

/**
 * A shortcut to send a letter
 * E.g send({to: ..., subject: ..., templatePath: ... })
 * @param options
 * @returns {*}
 */
function* send(options) {

  var letter = yield* createLetter(options);

  return yield* sendLetter(letter);
}

/**
 * Send an existing letter
 * @param letter
 * @returns {*}
 */
function* sendLetter(letter) {

  var sendMailMethod = transport.sendMail.bind(transport);

  letter.transportResponse = yield thunkify(sendMailMethod)(letter.data);
  letter.sent = true;

  log.debug("sent ", letter.toObject());

  yield letter.persist();

  return letter;
}


exports.Letter = require('./models/letter');
exports.send = send;
exports.createLetter = createLetter;
exports.sendLetter = sendLetter;