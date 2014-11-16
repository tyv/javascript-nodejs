var webdriver = require('selenium-webdriver');
const path = require('path');
const fixtures = require(path.join(__dirname, '../fixtures/db'));
const app = require('app');
const db = require('lib/dataUtil');
const config = require('config');

describe('auth', function() {

  var driver, server;

  before(function*() {
    driver = new webdriver.Builder().
      withCapabilities(webdriver.Capabilities.firefox()).
      build();

    //yield* db.loadDb(fixtures);

    server = app.listen(config.server.port);
  });

  it('logs in', function*() {

    function findFacebookButton() {
      return driver.findElement(webdriver.By.css('button[data-provider="facebook"]'));
    }

    driver.get('http://javascript.in/intro');
    driver.findElement(webdriver.By.css('button.sitetoolbar__login')).click();
    driver.wait(findFacebookButton);
    findFacebookButton().click();

    driver.getAllWindowHandles().then(function(handles) {
      driver.switchTo().window(handles[1]); // new window
    });

    driver.executeScript(function() {
      alert(window.readyState);
    });

    yield function(callback) {

    }

  });

  after(function() {
    driver.quit();
    server.close();
  });

});
