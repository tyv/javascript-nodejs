// use global variables, because head.js and main.js include different modules
var initHandlers = {};
var initWhenReadyCalled = {};

// Usage:
//  initWhenReady('login')
//    will trigger addInitHandler('login')
//    and wait if it doesn't exist yet

// if initWhenReady is first (from HTML)
//  -> initWhenReadyCalled[name] = true
//  -> then addInitHandler uses it

// if addInitHandler is first (from SCRIPT)
//  -> initHandlers[name] = handler
//  -> then initWhenReady uses it
function initWhenReady(name) {
//  console.log("initWhenReady", name);
  if (initHandlers[name]) {
    initHandlers[name]();
  } else {
    initWhenReadyCalled[name] = true;
  }
}

function addInitHandler(name, handler) {
//  console.log("addInitHandler", name, handler);
  if (initWhenReadyCalled[name]) {
    handler();
  } else {
    initHandlers[name] = handler;
  }
}

module.exports = {
  whenReady: initWhenReady,
  addHandler: addInitHandler
};
