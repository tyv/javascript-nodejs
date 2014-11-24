
// for local selenium, not a string, but a promise for address
var address = require('./server').address;
var webdriver = require('selenium-webdriver');
var hostname = require('os').hostname();
var config = require('config');

module.exports = function() {
  return new webdriver.Builder().
    usingServer(address).
    withCapabilities({
      browserName: config.test.e2e.browser,
      name: hostname + ': ' + new Date().toLocaleString(),
      build: process.env.TRAVIS_BUILD_NUMBER,
      username: config.sauceLabs.username,
      accessKey: config.sauceLabs.accessKey
    }).
    build();
};
