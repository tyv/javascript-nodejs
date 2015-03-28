var fs = require('fs');
var utils = require('utils');

// require(./helpers) doesn't work with slimerjs
var helpers = require(fs.workingDirectory + '/helpers');


var config = {
  start: 'http://javascript.in/tutorial/',

  // for an url return:
  // follow => to fetch it and it's content and gather links
  // no-follow => to check it's HTTP-status only
  // skip => don't load at all
  getCrawlMode: function(url) {

    if (~url.indexOf('disqus.')) return 'skip';
    if (~url.indexOf('?grep')) return 'skip';
    if (~url.indexOf('fonts.googleapis.com')) return 'skip';
    if (~url.indexOf('/share.php')) return 'skip';
    if (~url.indexOf('plnkr.co/')) return 'skip';

    if (~url.indexOf('javascript.in')) {
      return 'follow';
    }

    return 'no-follow';

  },

  logFilePath: fs.workingDirectory + '/log.json'

};

// Create Casper
var casper = require('casper').create({
  verbose:      true,
  logLevel:     'debug',
  pageSettings: {
    loadImages:  true,
    loadPlugins: false
  },
  // when a web-page is created, but not yet opened
 // onPageInitialized: onPageInitialized,
  // when a page requests a resource
  onResourceRequested: onResourceRequested
});


// Echo options hash to screen
utils.dump(casper.cli.options);

// ##################  Initializing Vars  #################

// URL arrays
var visitedUrls = [];
var pendingUrls = [];
var skippedUrls = [];
var refUrls = {};

// required and skipped values
var linkLimit = config.limit || 10000;

var resourceErrorsByRef = {};


// Initializing Data Object
var dataObj = {
  start:             config.start,
  date:              new Date(),
  links:             [],
  errors:            [],
  messages:          [],
  skippedLinksCount: 0,
  logFile:           '',
  linkCount:         1
};

function checkPageWithoutResources(url, callback) {

  var casperChecker = require('casper').create({
    verbose:      true,
    logLevel:     'debug',
    pageSettings: {
      loadImages:  false,
      loadPlugins: false
    },
    onResourceRequested: function(c, rd, req) {
      if (rd.url != url) req.abort();
    }
  });

  casperChecker.start(url, function(response) {
    this.log('CASPER CHECKER LOADED ' + url + ' ' + response.status, 'debug');
    callback(response);
  });

  casperChecker.run(function() {
    /* don't terminate casper cause it kills firefox for slimerjs */
  });


}

function spider(url) {

  // Add the URL to visited stack
  visitedUrls.push(url);

  // complex check (spider)
  casper.log("SPIDER OPEN " + url + " " + config.getCrawlMode(url));

  // fast check (no resources)
  if (config.getCrawlMode(url) == 'no-follow') {
    checkPageWithoutResources(url, function(response) {
      dataObj.links.push({
        url:    response.url,
        status: response.status
      });
      if (response.redirectURL) {

        if (!refUrls[response.redirectURL]) {
          refUrls[response.redirectURL] = [];
        }
        refUrls[response.redirectURL].push(response.url);
        pendingUrls.push(response.redirectURL);
      }
    });
    next();
    return;
  }


  casper.log("CASPER OPEN " + url);


  // Open the URL and modify
  casper.open(url).then(function() {

    casper.log("CASPER OPEN DONE " + url);

    // ##################  Setup Link Data  #################

    // Get current response status of URL
    var status = this.status().currentHTTPStatus;

    // Log url
    this.echo(this.colorizer.format(status, helpers.statusColor(status)) + ' ' + url);

    // Instantiate link object for log
    var link = {
      url:    url,
      status: status
    };

    // Push links to dataObj
    dataObj.links.push(link);


    // ##################  Process Links on Page  #################

    var baseUrl = this.getGlobal('location').origin;

    var formatErrors = casper.evaluate(function() {
      var errors = [];
      __utils__.findAll('.format_error').forEach(function(elem) {
        errors.push(elem.innerHTML);
      });
      return errors;
    });

    if (formatErrors.length) {
      var error = {
        errors: formatErrors,
        url: url
      };

      dataObj.errors.push(error);

      casper.log('FORMAT ERRORS: ' + formatErrors, 'error');
    }

    // Find links on the current page
    var localLinks = helpers.findLinks(this);

    //casper.log("SPIDER FOUND LINKS " + localLinks);
    // iterate through each localLink
    this.each(localLinks, function(self, link) {

      // Get new url
      var newUrl = helpers.absoluteUri(baseUrl, link);

      if (!refUrls[newUrl]) {
        refUrls[newUrl] = [];
      }
      refUrls[newUrl].push(url);

      // If url is not visited, pending or skipped:
      if (pendingUrls.indexOf(newUrl) === -1 &&
        visitedUrls.indexOf(newUrl) === -1 &&
        skippedUrls.indexOf(newUrl) === -1) {

        if (config.getCrawlMode(newUrl) != 'skip') {

          casper.log('shouldCrawl ' + newUrl, 'debug');

          pendingUrls.push(newUrl);

        } else {

          // add it to skipped array
          skippedUrls.push(newUrl);

          casper.log('Skipping ' + newUrl, 'debug');

          // add to counted skipped links
          dataObj.skippedLinksCount++;
        }
      } // eof visited, pending, skipped
    }); // eof each links


    casper.log("SPIDER FINISH " + url);
    next();

  }); // eof page function
}


function next() {

  // If there are any more URLs, run again.
  if (pendingUrls.length > 0 && dataObj.linkCount < linkLimit) {
    var nextUrl = pendingUrls.shift();
    dataObj.linkCount++;
    spider(nextUrl);
  } else {
    casper.log('There are no more URLs to be processed!', 'Warning');
  }

}


function onResourceRequested(casper, requestData, request) {
  casper.log("onResourceRequested " + requestData.url, 'debug');
  if (config.getCrawlMode(requestData.url) == 'skip') {
    casper.log("onResourceRequested: skip " + requestData.url);
    request.abort();
  }

  if (casper.page.url != 'about:blank' && config.getCrawlMode(casper.page.url) == 'no-follow') {
    casper.log("onResourceRequested: no-follow " + casper.page.url);
    request.abort();
  }
}

casper.on('page.error', function(msg, trace) {
  var error = {
    msg:  msg,
    file: trace[0].file,
    line: trace[0].line,
    func: trace[0]['function'],
    url: this.page.url
  };

  this.log('ERROR: ' + error.msg, 'error');
  this.log('file: ' + error.file, 'warning');
  this.log('line: ' + error.line, 'warning');
  this.log('function: ' + error.func, 'warning');

  dataObj.errors.push(error);
});

casper.on('remote.message', function(msg) {
  this.log('MESSAGE: ' + msg, 'WARNING');
  var message = {
    url: casper.getGlobal('location').href,
    msg: msg
  };
  dataObj.messages.push(message);
});

casper.on('error', function onCasperError(msg, backtrace) {
  casper.log('INTERNAL ERROR: ' + msg, 'ERROR');
  casper.log('BACKTRACE:' + backtrace, 'WARNING');
  casper.die('Crawl stopped because of errors.');
});

casper.on('resource.error', function(error) {
  if (error.errorCode == 99 || error.errorCode == 95) {
    // aborted (skipped?)
    return;
  }

  // optional @2x image absent
  if (~error.url.indexOf('@2x')) {
    return;
  }

  casper.log("resource.error " + error.errorCode + "[" + error.errorString + "]" + " " + error.url + " from " + this.page.url, 'debug');

  if (!resourceErrorsByRef[this.page.url]) resourceErrorsByRef[this.page.url] = [];
  resourceErrorsByRef[this.page.url].push(error);
});

function onComplete(casper) {

  casper.log('Crawl has completed!', 'INFO');

  dataObj.errUrls = dataObj.links.filter(function(link) {
    return link.status >= 400;
  }).map(function(link) {
    return {
      url:    link.url,
      status: link.status,
      refs:   utils.unique(refUrls[link.url])
    };
  });

  dataObj.resourceErrorsByRef = resourceErrorsByRef;

  var data = JSON.stringify(dataObj, undefined, 2);

  // write json file
  fs.write(config.logFilePath, data, 'w');

  casper.log('Data file can be found at ' + config.logFilePath + '.', 'INFO');
  casper.exit();
}

casper.start(dataObj.start, function() {
  this.log('SPIDER START ' + dataObj.start, 'info');
  spider(dataObj.start);
});


casper.log('SPIDER RUN', 'info');

casper.run(onComplete);

