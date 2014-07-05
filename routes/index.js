'use strict';

var log = require('lib/log')(module);
var config = require('config');

// Первым делом идут роуты для схем с жёстким началом /markup/* /task/*  и т.п.
// В конце идут роуты для статей и справочников, которые в корне сайта, например http://javascript.ru/String
// TODO: добавить обработку 404 Not Found, сделать возможность любому роуту легко вызывать ошибку 404, как и любую другую ошибку
module.exports = function(app) {

  app.get('/', require('controllers/frontpage').get);

  app.get('/stylesheets/main.css', function *(next) {
    yield require('stylus')
      .middleware(process.cwd() + '/app')
      .bind(null, this.req, this.res)(next);
  });

  if (process.env.NODE_ENV == 'development') {
    app.get('/markup/*', require('controllers/markup').get);
  }
};