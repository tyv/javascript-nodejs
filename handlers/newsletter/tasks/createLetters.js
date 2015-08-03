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
      // gulp newsletter:createLetters --slug js --templatePath ./extra/newsletters/js-1405.jade --subject 'Курс JavaScript: напоминание о собрании' --test iliakan@gmail.com --nounsubscribe
      .example("gulp newsletter:createLetters --slug nodejs --templatePath ./mail.jade --subject 'Тема письма'")
      .describe('slug', 'Названия рассылок NewsLetter через запятую')
      .describe('slugExcept', 'Названия рассылок NewsLetter через запятую, подписчиком которых не слать')
      .describe('templatePath', 'Шаблон для рассылки')
      .describe('subject', 'Тема письма')
      .describe('test', 'Email, на который выслать тестовое письмо.')
      .describe('nounsubscribe', 'Без ссылки на отписку.')
      .describe('track', 'Отслеживать переходы.')
      .demand(['slug', 'templatePath', 'subject'])
      .argv;

    return co(function* () {

      var slugs = args.slug.split(',').filter(String);
      var slugExcepts = args.slugExcept ? args.slugExcept.split(',').filter(String) : [];

      var newsletters = yield Newsletter.find({
        slug: {
          $in: slugs
        }
      }).exec();

      if (newsletters.length != slugs.length) {
        throw new Error("Can't find one or more newsletters with slugs: " + args.slug);
      }

      var newslettersExcept = yield Newsletter.find({
        slug: {
          $in: slugExcepts
        }
      }).exec();

      if (newslettersExcept.length != slugExcepts.length) {
        throw new Error("Can't find one or more newsletters with slugExcepts: " + args.except);
      }

      var newsletterIdToSlug = {};
      newsletters.forEach(function(n) {
        newsletterIdToSlug[n._id.toString()] = n.slug;
      });

      var newsletterIds = newsletters.map(function(n) {
        return n._id;
      });
      var newsletterExceptIds = newslettersExcept.map(function(n) {
        return n._id;
      });

      var release = yield NewsletterRelease.create({
        newsletters:       newsletterIds,
        newslettersExcept: newsletterExceptIds
      });


      // subscriptions which match any of newsletter slugs
      var subscriptions = yield Subscription.find({
        newsletters: {
          $in:  release.newsletters,
          $nin: release.newslettersExcept
        }
      }, {email: true, newsletters: true, accessKey: true, _id: false}).exec();


      if (args.test) {
        subscriptions = [
          new Subscription({
            email:       args.test,
            accessKey:   'test',
            newsletters: newsletters.map(function(n) {
              return n._id;
            })
          })
        ];
      }

      for (var i = 0; i < subscriptions.length; i++) {
        var subscription = subscriptions[i];
        var unsubscribeUrl = args.nounsubscribe ?
          null :
          config.server.siteHost + '/newsletter/subscriptions/' + subscription.accessKey;


        // listSlug is generated from a first newsletter, which causes the user to receive the message
        var listSlug = '';
        for (var j = 0; j < subscription.newsletters.length; j++) {
          var subscriptionNewsletterId = String(subscription.newsletters[j]);
          listSlug = newsletterIdToSlug[subscriptionNewsletterId];
          if (listSlug) break;
        }

        if (!listSlug) {
          throw new Error("No list slug for subscription (why receiving?) " + subscription._id);
        }

        yield* mailer.createLetter({
          from:           'informer',
          templatePath:   args.templatePath,
          track_clicks:   args.track ? true : false,
          to:             subscription.email,
          subject:        args.subject,
          unsubscribeUrl: unsubscribeUrl,
          labelId:        release._id,
          headers:        {
            Precedence:         'bulk',
            'List-ID':          '<' + listSlug + '.list-id.javascript.ru>',
            'List-Unsubscribe': '<' + unsubscribeUrl + '>'
          }
        });

        gutil.log("Created letter to " + subscription.email);

      }

    });


  };
};
