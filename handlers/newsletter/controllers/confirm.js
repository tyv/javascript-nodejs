const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const config = require('config');

exports.get = function*() {
  this.nocache();

  const subscription = yield Subscription.findOne({
    accessKey: this.params.accessKey
  }).exec();

  if (!subscription) {
    this.throw(404, "Нет такой подписки");
  }

  subscription.confirmed = true;
  yield subscription.persist();

  this.addFlashMessage('success', 'Подписка подтверждена.');
  this.redirect('/newsletter/subscriptions/' + this.params.accessKey);

};
