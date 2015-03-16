var co = require('co');
var fs = require('fs');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
const path = require('path');
const Newsletter = require('../models/newsletter');
const NewsletterRelease = require('../models/newsletterRelease');
const Subscription = require('../models/subscription');
const mailer = require('mailer');
const config = require('config');

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Slug is required.")
      .demand(['slug'])
      .argv;

    return co(function* () {

      var newsletter = yield Newsletter.findOne({
        slug: args.slug
      }).exec();

      if (!newsletter) {
        throw new Error("No newsletter with slug: " + args.slug);
      }

      var release = yield NewsletterRelease.create({
        newsletter: newsletter._id
      });

      var subscriptions = yield Subscription.find({
        newsletter: newsletter._id,
        confirmed:  true
      }, {email: true, accessKey: true, _id: false}).exec();


      for (var i = 0; i < subscriptions.length; i++) {
        var subscription = subscriptions[i];
        var unsubscribeUrl = (config.server.siteHost || 'http://javascript.in') + '/newsletter/remove/' + subscription.accessKey;
        yield* mailer.createLetter({
          from:   'informer',
          templatePath:   path.join(__dirname, '../templates/test-email'),
          to: subscription.email,
          subject: "Тест рассылки",
          unsubscribeUrl: unsubscribeUrl,
          newsletterRelease: release._id,
          headers:        {
            Precedence: 'bulk',
            'List-ID':          '<' + newsletter.slug + '.list-id.javascript.ru>',
            'List-Unsubscribe': '<' + unsubscribeUrl + '>'
          }
        });

      }

    });


  };
};
