const log = require('log')();
const SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
const webdriver = require('selenium-webdriver');
const config = require('config');

var seleniumServer, seleniumServerAddress;

// SELENIUM_LOCAL means using local selenium server + browser
// otherwise sauceLabs

// SELENIUM_DEBUG turns on debugging output from the local selenium server
// (sauceLabs doesn't use it, because it gives full log on-site)
if (+process.env.SELENIUM_LOCAL) {

  var pathToJar = require.resolve('lib/selenium/selenium-server-standalone-2.44.0.jar');

  // stdio goes to child_process.spawn()
  // must be an array of file descriptors or stream which have file descriptors or ...
  // because of file descriptors can't just redirect to log (there must be a way btw)
  // so using a variable
  seleniumServer = new SeleniumServer(pathToJar, {
    port:  4444,
    stdio: process.env.SELENIUM_DEBUG ? 'inherit' : 'ignore' // ignore by default, but inherit shows all output
  });

  // selenium starts unref'ed
  seleniumServer.start();
  exports.server = seleniumServer;
  exports.address = seleniumServer.address();
} else {
  exports.address = config.sauceLabs.address;
}

