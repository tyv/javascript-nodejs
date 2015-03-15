const path = require('path');
const Newsletter = require('../models/newsletter');
const Subscription = require('../models/subscription');
const crypto = require('crypto');
const sendMail = require('sendMail');
const config = require('config');

exports.post = function*() {
  const newsletter = yield Newsletter.findOne({
    slug: this.request.body.slug
  }).exec();

  if (!newsletter) {
    this.throw(404, "Нет такой рассылки");
  }

  const subscription = new Subscription({
    email:      this.request.body.email,
    newsletter: newsletter._id
  });


  if (this.req.user && this.req.user.email == this.request.email.slug) {
    subscription.confirmed = true;

    yield subscription.persist();

    this.body = {
      message: `Вы успешно подписаны, ждите писем на адрес ${this.request.email.slug}.`
    };

  } else {
    subscription.confirmed = false;
    yield subscription.persist();


    yield sendMail({
      templatePath: path.join(this.templateDir, 'confirm-email'),
      subject:      "Подтверждение: " + newsletter.title,
      to:           this.request.body.email,
      link:         config.server.siteHost + '/newsletter/confirm/' + subscription.accessKey
    });

    this.body = {
      message: "Проверьте почту " + this.request.body.email + " и подтвердите подписку, перейдя по ссылке в письме."
    };
  }
};
