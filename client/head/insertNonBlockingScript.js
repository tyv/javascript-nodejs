
// insert <script src="..."> into document
//   --> does not block rendering
//   --> keeps execution order
module.exports = function(src) {
  var script = document.createElement('script');
  script.src = src;
  script.async = false; // maintain the execution order
  document.head.appendChild(script);
  return script; // for onload handlers
};
