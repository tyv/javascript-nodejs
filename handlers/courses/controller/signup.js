const payments = require('payments');
var getOrderInfo = payments.getOrderInfo;
var Course = require('../models/course');
var CourseGroup = require('../models/courseGroup');
var config = require('config');
var moment = require('momentWithLocale');
var money = require('money');
var pluralize = require('textUtil/pluralize');


exports.get = function*() {
  this.nocache();

  this.locals.sitetoolbar = true;

  var group;

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

  } else {

    var group = this.locals.group = this.groupBySlug;

    // a visitor can't reach this page through UI, only by direct link
    // if the group is full
    if (!group.isOpenForSignup) {
      this.throw(403, "Запись в эту группу завершена.");
    }

    if (!this.isAuthenticated()) {
      this.redirect(group.course.getUrl());
      return;
    }

    this.locals.title = group.course.title;
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
    return moment(date).format('D MMM YY').replace(/[а-я]/, function(letter) {
      return letter.toUpperCase();
    });
  };

  this.locals.rateUsdRub = money.convert(1, {from: 'USD', to: 'RUB'});

  this.locals.groupInfo = {
    price:           group.price,
    participantsMax: group.participantsLimit,
    slug:            group.slug
  };

  this.body = this.render('signup');
};
