// Usage: require('log')()

var bunyan = require('bunyan');
var reqSerializer = require('./reqSerializer');
var reqVerboseSerializer = require('./reqVerboseSerializer');
var resSerializer = require('./resSerializer');
var errSerializer = require('./errSerializer');
var httpErrorSerializer = require('./httpErrorSerializer');
var path = require('path');

// log.debug({req: ...})
var serializers = {
  reqVerbose: reqVerboseSerializer,
  req:        reqSerializer,
  res:        resSerializer,
  err:        errSerializer,
  httpError:  httpErrorSerializer
};

// we may want development logging in test mode
var env = process.env.NODE_ENV;

// if no name, then name is a parent module filename (or it's directory if index)
// options.bufferLowLevel enables ring buffer for <= warn records
module.exports = function(name, options) {
  options = options || {};

  if (!name) {
    name = path.basename(module.parent.filename, '.js');
    if (name == 'index') {
      name = path.basename(path.dirname(module.parent.filename)) + '/index';
    }
  }

  var streams;

  if (process.env.LOG_LEVEL) {
    streams = [
      {
        level:  process.env.LOG_LEVEL,
        stream: process.stdout
      }
    ]
  } else {

    switch (env) {
    case 'development':
      streams = [
        {
          level:  'debug',
          stream: process.stdout
        }
      ];
      break;
    case 'test':
      streams = [/* don't log anything, set LOG_ENV if want to see errors */];
      break;
    case 'production':
      // normally I see only info, but look in error in case of problems
      streams = [
        {
          level:  'info',
          stream: process.stdout
        },
        {
          level:  'info',
          stream: process.stderr
        }
      ];

      var RequestCaptureStream = require('requestCaptureStream');

      // gather all data for req_id, but log only if warn happens
      // ...and dump to stderr (in addition to
      if (options.bufferLowLevel) {
        streams.push({
          level:  'debug',
          type:   'raw',
          stream: new RequestCaptureStream({
            maxRecords:    150,
            maxRequestIds: 2000,
            dumpDefault:   true, // if error happens also dump all records, not bound to a request
            // default records dumped AFTER request
            stream:        process.stderr
          })
        });
      }
    }
  }

  return bunyan.createLogger({
    name:        name,
    streams:     streams,
    serializers: serializers
  });
};


delete require.cache[__filename];
