const log = require('log')();
const SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
const webdriver = require('selenium-webdriver');

var pathToJar = require.resolve('lib/testing/selenium-server-standalone-2.44.0.jar');

// stdio goes to child_process.spawn()
// must be an array of file descriptors or stream which have file descriptors or ...
// because of file descriptors can't just redirect to log (there must be a way btw)
// so using a variable
seleniumServer = new SeleniumServer(pathToJar, {
  port:  4444,
  stdio: process.env.DEBUG_SELENIUM ? 'inherit' : 'ignore' // ignore by default, but inherit shows all output
});

seleniumServer.start();

exports.server = seleniumServer;

exports.firefox = function() {
  return new webdriver.Builder().
    usingServer(seleniumServer.address()).
    withCapabilities(webdriver.Capabilities.firefox()).
    build();
};

