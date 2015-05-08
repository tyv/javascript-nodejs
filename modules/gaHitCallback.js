
// gaCallback(f) will return a wrapper that works only once
// autocalled after 500ms
module.exports = function(f) {
  function callback() {
    if (callback.wasCalled) return;
    callback.wasCalled = true;
    f();
  }
  setTimeout(callback, 500);
  return callback;
};
