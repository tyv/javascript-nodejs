var bunyan = require('bunyan');
var RequestCaptureStream = require('requestCaptureStream').RequestCaptureStream;
var reqSerializer = require('./reqSerializer');
var reqVerboseSerializer = require('./reqVerboseSerializer');
var resSerializer = require('./resSerializer');
var errSerializer = require('./errSerializer');
var path = require('path');

var serializers = {
  reqVerbose: reqVerboseSerializer,
  req:        reqSerializer,
  res:        resSerializer,
  err:        errSerializer
};

// we may want development logging in test mode
var logEnv = process.env.LOG_ENV || process.env.NODE_ENV;

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
  switch (logEnv) {
  case 'development':
    streams = [
      {
        level:  'debug',
        stream: process.stdout
      }
    ];
    break;
  case 'test':
    streams = [
      {
        level:  'error',
        stream: process.stderr
      }
    ];
    break;
  case 'production':
    // gather all data for req_id, but log only if warn happens
    streams = [
      {
        level:  'warn',
        stream: process.stderr
      }
    ];

    if (options.bufferLowLevel) {
      streams.push({
        level:  'debug',
        type:   'raw',
        stream: new RequestCaptureStream({
          maxRecords:    150,
          maxRequestIds: 2000,
          dumpDefault:   true,
          stream:        process.stderr
        })
      });
    }
  }

  return bunyan.createLogger({
    name:        name,
    streams:     streams,
    serializers: serializers
  });
};


delete require.cache[__filename];
