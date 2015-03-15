var co = require('co');
var fs = require('fs');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const Letter = require('../models/letter');
const sendMail = require('sendMail');
const config = require('config');


module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Slug is required.")
      .demand(['slug'])
      .argv;

    var packCreated = new Date();

    return co(function* () {

      var newsletter = yield Newsletter.findOne({
        slug: args.slug
      }).exec();

      if (!newsletter) {
        throw new Error("No newsletter with slug: " + args.slug);
      }

      var subscriptions = yield Subscription.find({
        newsletter: newsletter._id,
        confirmed:  true
      }, {email: true, accessKey: true, _id: false}).exec();

      // TMP
      yield Letter.destroy({});

      for (var i = 0; i < subscriptions.length; i++) {
        var subscription = subscriptions[i];
        var unsubscribeUrl = (config.server.siteHost || 'http://javascript.in') + '/newsletter/remove/' + subscription.accessKey;
        yield Letter.create({
          email:       subscription.email,
          newsletter:  newsletter._id,
          packCreated: packCreated,
          sent:        false,
          data:        {
            templatePath:   path.join(__dirname, '../templates/test-email'),
            subject:        "Тест рассылки",
            to:             'iliakan@gmail.com', //subscription.email,
            unsubscribeUrl: unsubscribeUrl,
            headers:        {
              Precedence: 'bulk',
              'List-ID':          '<' + newsletter.slug + '.list-id.javascript.ru>',
              'List-Unsubscribe': '<a@b.javascript.ru>'
            }
          }
        });
      }

    });
  };
};


