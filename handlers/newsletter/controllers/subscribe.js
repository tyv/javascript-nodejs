const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const sendMail = require('mailer').send;
const config = require('config');

// subscribe a single newsletter (post from somewhere outside of the module)
exports.post = function*() {

  const newsletter = yield Newsletter.findOne({
    slug: this.request.body.slug
  }).exec();

  if (!newsletter) {
    this.throw(404, "Нет такой рассылки");
  }

  if (this.req.user && this.req.user.email == this.request.body.email) {
    // registered users need no confirmation

    var subscription = yield Subscription.findOne({
      email: this.request.body.email
    }).exec();

    if (subscription) {
      subscription.newsletters.addToSet(newsletter._id);
      subscription.confirmed = true;
    } else {
      subscription = new Subscription({
        email:       this.request.body.email,
        newsletters: [newsletter._id],
        confirmed:   true
      });
    }

    yield subscription.persist();

    this.body = {
      message: `Вы успешно подписаны, ждите писем на адрес ${subscription.email}.`
    };

  } else {
    var subscription = yield Subscription.findOne({
      email: this.request.body.email
    }).exec();

    if (!subscription) {
      subscription = new Subscription({
        email:     this.request.body.email,
        confirmed: false
      });
    }

    subscription.newsletters.addToSet(newsletter._id);

    yield subscription.persist();

    if (subscription.confirmed) {
      this.body = {
        message: `Вы успешно подписаны.`
      };
    } else {

      yield sendMail({
        templatePath:    path.join(this.templateDir, 'confirm-email'),
        subject:         "Подтверждение подписки на JavaScript.ru",
        to:              subscription.email,
        link:            (config.server.siteHost || 'http://javascript.in') + '/newsletter/confirm/' + subscription.accessKey
      });

      this.body = {
        message: `Проверьте почту ${subscription.email} и подтвердите подписку, перейдя по ссылке в письме.`
      };
    }
  }


};

