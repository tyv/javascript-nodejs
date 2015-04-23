var elasticsearch = require('elasticsearch');
var config = require('config');

const log = require('log')();

// logger from
// http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/logging.html
function LogToBunyan(config) {
  // config is the object passed to the client constructor.
  this.error = log.error.bind(log);
  this.warning = log.warn.bind(log);
  this.info = log.info.bind(log);
  this.debug = log.debug.bind(log);
  this.trace = function(method, requestUrl, body, responseBody, responseStatus) {
    log.trace({
      method:         method,
      requestUrl:     requestUrl,
      body:           body,
      responseBody:   responseBody,
      responseStatus: responseStatus
    });
  };
  this.close = function() {
    /* bunyan's loggers do not need to be closed */
  };
}

var client;
module.exports = function() {
  if (!client) client = new elasticsearch.Client({
    host: config.elastic.host,
    log:  LogToBunyan
  });

  return client;
};

