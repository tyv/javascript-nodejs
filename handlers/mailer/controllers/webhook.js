var path = require('path');
var MandrillEvent = require('../models/mandrillEvent');
var config = require('config');
var crypto = require('crypto');
var capitalizeKeys = require('lib/capitalizeKeys');

exports.post = function*() {

  var signature = this.get('X-Mandrill-Signature');

  if (generateMandrillSignature(this.request.body) != signature) {
    this.throw(401, "Wrong signature");
  }

  var mandrillEvents;
  try {
     mandrillEvents = JSON.parse(this.request.body.mandrill_events);
  } catch(e) {}

  if (!Array.isArray(mandrillEvents)) {
    this.throw(400);
  }

  mandrillEvents = capitalizeKeys(mandrillEvents);

  for (var i = 0; i < mandrillEvents.length; i++) {
    var event = mandrillEvents[i];
    yield MandrillEvent.create({payload: event});
  }

  this.body = '';
};


function generateMandrillSignature(body) {
  var signedData = config.mailer.mandrill.webhookUrl;

  var keys = Object.keys(body);

  keys.sort();

  for (var i = 0; i < keys.length; i++) {
    signedData += keys[i] + body[keys[i]];
  }

  return crypto.createHmac('sha1', config.mailer.mandrill.webhookKey).update(signedData, 'utf8', 'binary').digest('base64');
}


