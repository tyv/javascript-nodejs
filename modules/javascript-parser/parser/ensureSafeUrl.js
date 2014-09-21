/**
 * Checks if the protocol is allowed (if any)
 * Throws if it is not.
 */
var HREF_PROTOCOL_REG = require('../consts').HREF_PROTOCOL_REG;
var ParseError = require('./parseError');

function ensureSafeUrl(url) {

  var protocol = url.replace(/[\x00-\x20]/g, '').match(HREF_PROTOCOL_REG);
  if (protocol) {
    protocol = protocol[1].trim();
  }

  if (!protocol) return;

  if (!~["http", "ftp", "https", "mailto"].indexOf(protocol.toLowerCase())) {
    throw new ParseError("div", "Protocol " + protocol + " is not allowed");
  }

}

module.exports = ensureSafeUrl;
