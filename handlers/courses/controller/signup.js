const payments = require('payments');
var getOrderInfo = payments.getOrderInfo;
var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var CourseInvite = require('../models/courseInvite');
var config = require('config');
var moment = require('momentWithLocale');
var money = require('money');
var pluralize = require('textUtil/pluralize');


exports.get = function*() {
  this.nocache();

  this.locals.sitetoolbar = true;

  var group;

  if (!this.isAuthenticated()) {
    this.authAndRedirect(this.originalUrl);
    return;
  }

  if (this.params.orderNumber) {
    yield* this.loadOrder({
      ensureSuccessTimeout: 10000
    });

    this.locals.order = this.order;
    this.locals.title = 'Заказ №' + this.order.number;

    this.locals.changePaymentRequested = Boolean(this.query.changePayment);

    group = this.locals.group = yield CourseGroup.findById(this.order.data.group).populate('course').exec();

    if (!group) {
      this.throw(404, "Нет такой группы.");
    }

    if (this.order.status == payments.Order.STATUS_SUCCESS) {
      var invite = yield CourseInvite.findOne({email: this.user.email, accepted: false}).exec();
      if (invite) this.locals.hasInvite = true;

      if (this.order.data.count > 1 || this.order.data.emails[0] != this.user.email) {
        this.locals.hasOtherParticipants = true;
      }
    }

  } else {

    group = this.locals.group = this.groupBySlug;

    // a visitor can't reach this page through UI, only by direct link
    // if the group is full
    if (!group.isOpenForSignup) {
      this.throw(403, "Запись в эту группу завершена.");
    }

    this.locals.title = "Регистрация\n" + group.title;
  }

  this.locals.paymentMethods = require('../lib/paymentMethods');

  this.locals.breadcrumbs = [
    {title: 'JavaScript.ru', url: 'http://javascript.ru'},
    {title: 'Курсы', url: '/courses'}
  ];

  if (this.order) {
    this.locals.orderInfo = yield* getOrderInfo(this.order);
    this.locals.receiptTitle = `Участие в курсе для ${this.order.data.count}
      ${pluralize(this.order.data.count, 'человека', 'человек', 'человек')}`;

    this.locals.receiptAmount = this.order.amount;
    this.locals.receiptContactPhone = this.order.data.contactPhone;
    this.locals.receiptContactName = this.order.data.contactName;

  } else {
    this.locals.orderInfo = {};
  }

  this.locals.mailto = "mailto:orders@javascript.ru";
  if (this.order) {
    this.locals.mailto += '?subject=' + encodeURIComponent('Заказ ' + this.order.number);
  }


  this.locals.formatGroupDate = function(date) {
    return moment(date).format('D MMM YYYY').replace(/[а-я]/, function(letter) {
      return letter.toUpperCase();
    });
  };

  this.locals.rateUsdRub = money.convert(1, {from: 'USD', to: 'RUB'});

  var price = group.price;

  if (this.query.code) {
    var discount = yield* payments.Discount.findByCodeAndModule(this.query.code, 'courses');
    if (discount && discount.data.slug == group.slug) {
      price = discount.adjustAmount(price);
    }
  }

  this.locals.groupInfo = {
    price:           price,
    participantsMax: group.participantsLimit,
    slug:            group.slug
  };

  this.body = this.render('signup');
};
