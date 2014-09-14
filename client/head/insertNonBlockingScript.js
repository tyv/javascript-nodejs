var versions = require('client/versions');

// insert <script src="..."> into document
//   --> does not block rendering
//   --> keeps execution order
module.exports = function(src, options) {
  var script = document.createElement('script');
  if (versions[src]) {
    src = src.replace('.js', '.v' + versions[src] + '.js');
  }
  script.src = src;
  script.async = options.async || false; // maintain the execution order if async is not set
  document.head.appendChild(script);
  return script; // for onload handlers
};

