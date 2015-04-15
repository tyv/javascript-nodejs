var mongoose = require('lib/mongoose');
var parse = require('csv-parse');
var fs = require('fs');
var co = require('co');
var thenify = require('thenify');
var Subscription = require('newsletter').Subscription;
var Newsletter = require('newsletter').Newsletter;

co(function*() {

  var newsletterJs = yield Newsletter.findOne({slug: 'js'}).exec();
  var newsletterAdvanced = yield Newsletter.findOne({slug: 'advanced'}).exec();

  var input = fs.readFileSync("/tmp/js.csv");
  var js = yield thenify(parse)(input, {});
  js.shift();
  js = js.map(function(record) {
    return record[1];
  });

  var input = fs.readFileSync("/tmp/mk.csv");
  var advanced = yield thenify(parse)(input, {});
  advanced.shift();
  advanced = advanced.map(function(record) {
    return record[1];
  });

  var subscriptions = {};

  for (var i = 0; i < js.length; i++) {
    var email = js[i];

    console.log(email);
    var subscription = yield Subscription.findOne({email: email}).exec();
    if (!subscription) {
      subscription = new Subscription({
        email: email
      });
    }
    subscription.confirmed = true;
    subscription.newsletters.addToSet(newsletterJs._id);
    yield subscription.persist();
  }


  for (var i = 0; i < advanced.length; i++) {
    var email = advanced[i];

    console.log(email);
    var subscription = yield Subscription.findOne({email: email}).exec();
    if (!subscription) {
      subscription = new Subscription({
        email: email
      });
    }
    subscription.confirmed = true;
    subscription.newsletters.addToSet(newsletterAdvanced._id);
    yield subscription.persist();
  }

}).then(console.log).catch(function(e) {
  console.log(e.message, e.stack , e);
});

