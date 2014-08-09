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
