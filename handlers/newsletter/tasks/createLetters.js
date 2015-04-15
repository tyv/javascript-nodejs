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
      .example("gulp newsletter:createLetters --slug nodejs --templatePath ./mail.jade --subject 'Тема письма'")
      .describe('slug', 'Названия рассылок NewsLetter через запятую')
      .describe('templatePath', 'Шаблон для рассылки')
      .describe('subject', 'Тема письма')
      .describe('test', 'Email, на который выслать тестовое письмо.')
      .demand(['slug', 'templatePath', 'subject'])
      .argv;

    return co(function* () {

      var slugs = args.slug.split(',').filter(String);

      var newsletters = yield Newsletter.find({
        slug: {
          $in: slugs
        }
      }).exec();

      if (newsletters.length != slugs.length) {
        throw new Error("Can't find one or more newsletters with slugs: " + args.slug);
      }

      var release = yield NewsletterRelease.create({
        newsletters: newsletters
      });


      // subscriptions which match any of newsletter slugs
      var subscriptions = yield Subscription.find({
        newsletters: {
          $in: newsletters
        },
        confirmed:   true
      }, {email: true, accessKey: true, _id: false}).exec();


      if (args.test) {
        subscriptions = [
          new Subscription({
            email: args.test,
            accessKey: 'notexists'
          })
        ];
      }

      for (var i = 0; i < subscriptions.length; i++) {
        var subscription = subscriptions[i];
        var unsubscribeUrl = (config.server.siteHost || 'http://javascript.in') + '/newsletter/subscriptions/' + subscription.accessKey;
        yield* mailer.createLetter({
          from:                'informer',
          templatePath:        args.templatePath,
          to:                  subscription.email,
          subject:             args.subject,
          unsubscribeUrl:      unsubscribeUrl,
          newsletterRelease:   release._id,
          headers:             {
            Precedence:         'bulk',
            'List-ID':          '<' + slugs.join('.') + '.list-id.javascript.ru>',
            'List-Unsubscribe': '<' + unsubscribeUrl + '>'
          }
        });

        gutil.log("Created letter to " + subscription.email);

      }

    });


  };
};
