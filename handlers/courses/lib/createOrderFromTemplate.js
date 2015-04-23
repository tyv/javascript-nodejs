var Order = require('payments').Order;
var OrderCreateError = require('payments').OrderCreateError;
var CourseGroup = require('../models/courseGroup');
var pluralize = require('textUtil/pluralize');

// middleware
// create order from template,
// use the incoming data if needed
module.exports = function*(orderTemplate, user, requestBody) {

  var group = yield CourseGroup.findOne({slug: requestBody.slug}).exec();

  var orderData = {
    slug: group.slug
  };
  orderData.count = +requestBody.count;

  if (group.participantsLimit === 0) {
    throw new OrderCreateError("Извините, в этой группе уже нет мест.");
  }

  if (orderData.count > group.participantsLimit) {
    throw new OrderCreateError("Извините, уже нет столько мест. Уменьшите количество участников до " + group.participantsLimit + '.');
  }

  orderData.contactName = String(requestBody.contactName);

  if (!orderData.contactName) {
    throw new OrderCreateError("Не указано контактное лицо.");
  }

  orderData.contactPhone = String(requestBody.contactPhone || '');

  var emails = requestBody.emails;
  if (!Array.isArray(emails)) {
    throw new OrderCreateError("Отсутствуют участники.");
  }
  orderData.emails = emails.filter(Boolean).map(String);

  if (!user || !user.email) {
    throw new OrderCreateError("Вы не авторизованы.");
  }

  var order = new Order({
    title:  group.title,
    amount: orderData.count * group.price,
    module: orderTemplate.module,
    data:   orderData,
    email:  user.email
  });

  yield order.persist();

  return order;

};


