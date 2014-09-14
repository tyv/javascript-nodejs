const mongoose = require('mongoose');
const session = require('koa-generic-session');
const mongooseStore = require('koa-session-mongoose');
const config = require('config');

module.exports = function(app) {

  app.use(session({
    key: 'sid',
    store: mongooseStore.create({
      model: 'Session'
    })
  }));

  app.keys = config.session.keys;  // needed for cookie-signing

};
