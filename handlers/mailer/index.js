var inlineCss = require('./inlineCss');
var config = require('config');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var jade = require('lib/serverJade');
var mandrill = require('./mandrill');
var logoBase64 = fs.readFileSync(path.join(config.projectRoot, 'assets/img/logo.png')).toString('base64');
var log = require('log')();
var Letter = require('./models/letter');
var capitalizeKeys = require('lib/capitalizeKeys');

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
  var message = {};

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

  message.html = letterHtml;
  message.subject = options.subject;
  message.from_email = sender.fromEmail;
  message.from_name = sender.fromName;

  message.to = (typeof options.to == 'string') ? [{email: options.to}] : options.to;

  for (var i = 0; i < message.to.length; i++) {
    var recepient = message.to[i];
    if (!recepient.email) {
      throw new Error("No email for recepient:" + recepient + " message options:" + JSON.stringify(options));
    }
  }

  message.headers = options.headers;

  // auto generate text by default (spamassassin wants that)
  message.auto_text = "auto_text" in options ? options.auto_text : true;

  message.track_opens = options.track_opens;
  message.track_clicks = options.track_clicks;

  var letter = yield Letter.create({
    message: message,
    labelId: options.labelId,
    label:   options.label
  });

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

  if (process.env.NODE_ENV == 'test' || process.env.MAILER_DISABLED) {
    letter.transportResponse = [];
  } else {
    letter.transportResponse = yield mandrill.messages.send({
      message: letter.message
    });

    letter.transportResponse = capitalizeKeys(letter.transportResponse);
  }

  letter.sent = true;

  log.debug("sent ", letter.toObject());

  yield letter.persist();

  return letter;
}


var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.verboseLogger.logPaths.add('/mailer/:any*');
  app.use(mountHandlerMiddleware('/mailer', __dirname));
};


exports.Letter = require('./models/letter');
exports.send = send;
exports.createLetter = createLetter;
exports.sendLetter = sendLetter;
