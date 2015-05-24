"use strict";

const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const SubscriptionAction = require('../models/subscriptionAction');
const sendMail = require('mailer').send;
const config = require('config');
const _ = require('lodash');
const notify = require('../lib/notify');

const ACTION_ADD = 'add';
const ACTION_REPLACE = 'replace';
const ACTION_REMOVE = 'remove';

/**
 * Subscribe to newsletters
 * fields:
 *   slug - one or many slugs of newsletters: slug=js&slug=nodejs
 *   replace - boolean, whether to add or replace newsletters
 *   remove - boolean, if true, destroy
 *   accessKey - load given subscription and give full rights over it
 * @returns {*}
 */
exports.post = function*() {

  var self = this;

  var subscription;

  // read subscription first
  // if no subscription, error must come first before any other errors
  if (this.request.body.accessKey) {
    subscription = yield Subscription.findOne({
      accessKey: this.request.body.accessKey
    }).exec();
    if (!subscription) {
      this.throw(404, "Нет такой подписки.");
    }
  } else {
    if (!this.request.body.email) {
      this.throw(404, "Email не указан.");
    }
    subscription = yield Subscription.findOne({
      email: this.request.body.email
    }).exec();
  }

  var email = subscription ? subscription.email : this.request.body.email;


  // may be empty (e.g. for remove request)
  var newsletterIds = yield readNewsletterIds.call(this);

  // important:
  // remove has priority, because may come with (default) replace
  var action = this.request.body.remove ? ACTION_REMOVE :
    this.request.body.replace ? ACTION_REPLACE : ACTION_ADD;


  // full access if user for himself OR accessKey is given
  var isFullAccess = this.user && this.user.email == this.request.body.email ||
    subscription && subscription.accessKey == this.request.body.accessKey;

  function respond(message) {
    var accepts = self.accepts('json', 'html');

    if (accepts == 'json') {
      // allow XHR from javascript.ru
      if (self.get('Origin') == 'http://javascript.ru') {
        self.set('Access-Control-Allow-Origin', 'http://javascript.ru');
      }
      self.body = {
        message: message
      };
    }

    if (accepts == 'html') {
      if (isFullAccess) {
        if (action == ACTION_REMOVE) {
          self.body = self.render("removed");
        } else {
          self.addFlashMessage('success', message);
          self.redirect('/newsletter/subscriptions/' + subscription.accessKey);
        }
      } else {
        self.body = self.render("pending", {message: message});
      }
    }
  }


  if (isFullAccess) {

    let subscriptionAction = new SubscriptionAction({
      action:      action,
      email:       email,
      newsletters: newsletterIds
    });

    subscription = yield* subscriptionAction.apply();

    if (action == ACTION_REMOVE) {
      respond(`Адрес ${email} удалён из базы подписок.`);
      return;
    }

    if (subscription) {
      respond(`Настройки обновлены.`);
    } else {
      respond(`Вы успешно подписаны, ждите писем на адрес ${email}.`);
    }
    return;

  } else {

    if (action == ACTION_REMOVE) {
      // even if no subscription, we say "ok sending a letter"
      // so that an anon user will not learn if the email is subscribed or not.
      if (subscription) {
        let subscriptionAction = yield SubscriptionAction.create({
          action: 'remove',
          email:  email
        });
        yield notify(subscriptionAction);
      }
      respond(`На адрес ${email}, если он был подписан, направлен запрос подтверждения.`);
      return;
    }

    var subscriptionAction = yield SubscriptionAction.create({
      action:      action,
      newsletters: newsletterIds,
      email:       email
    });

    yield notify(subscriptionAction);
    respond(`На адрес ${email} направлен запрос подтверждения.`);

  }


};


function* readNewsletterIds() {
  var slugs = (function readSlugs(request) {
    var slugs = request.body.slug || [];

    if (!Array.isArray(slugs)) {
      slugs = [slugs];
    }
    slugs = slugs.map(String);
    return slugs;
  })(this.request);

  const newsletters = yield Newsletter.find({
    slug: {
      $in: slugs
    }
  }).exec();

  const newsletterIds = _.pluck(newsletters, '_id');

  return newsletterIds;
}
