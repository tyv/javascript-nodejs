const path = require('path');
const sendMail = require('mailer').send;
const config = require('config');

module.exports = function*(subscriptionAction) {

  if (subscriptionAction.action == 'remove') {
    yield sendMail({
      templatePath: path.join(__dirname, '../templates/emailRemove'),
      subject:      "Удаление адреса из базы подписок",
      to:           subscriptionAction.email,
      link:         (config.server.siteHost || 'http://javascript.in') + '/newsletter/action/' + subscriptionAction.accessKey
    });
  } else {

    yield sendMail({
      templatePath: path.join(__dirname, '../templates/emailConfirm'),
      subject:      "Подтвердите подписку",
      to:           subscriptionAction.email,
      link:         (config.server.siteHost || 'http://javascript.in') + '/newsletter/action/' + subscriptionAction.accessKey
    });
  }

};
