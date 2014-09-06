/*
 crap code to log & isolate steps for stackless errors when node-inspector dies
 p() will print next number
 */
if (process.env.NODE_ENV == 'development') {

  global.p = function() {
    var stack = new Error().stack.split("\n")[2].trim();
    console.log("----> " + global.p.counter++ + " at " + stack);
  };
  global.p.counter = 1;




} else {
  global.p = function() {

  };
}

/**
 * When a code dies with a strange event error w/o trace
 * Here I try to see what actually died
 */
if (process.env.DUMP_EVENT_ERRORS) {
  var proto = require('events').EventEmitter.prototype;
  var emit = proto.emit;
  proto.emit = function(type) {
    if (type == 'error') console.log(this, arguments);
    emit.apply(this, arguments);
  };

}
