'use strict';

const config = require('config');
const escapeHtml = require('escape-html');

function renderUserError(error) {
  /*jshint -W040 */
  this.status = error.status || 500;

  var preferredType = this.accepts('html', 'json');

  if (preferredType == 'json') {
    this.body = error;
  } else {
    this.body = this.render("/error", {error: error});
  }
}

function renderDevError(error) {
  /*jshint -W040 */
  this.status = 500;

  var preferredType = this.accepts('html', 'json');

  if (preferredType == 'json') {
    this.body = error;
  } else {
    var stack = (error.stack || '')
      .split('\n').slice(1)
      .map(function(v) {
        return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>';
      }).join('');

    this.type = 'text/html; charset=utf-8';
    this.body = "<html><body><h1>" + error.message + "</h1><ul>" + stack + "</ul></body></html>";
  }

}

function renderError(err) {
  /*jshint -W040 */

  if (err.status) {
    // user-level error

    // this.log.error({httpError: err});

    renderUserError.call(this, err);
  } else {

    // if error is "call stack too long", then log.error(err) is not verbose
    // so I cast it to string
    this.log.error(err.toString());
    this.log.error(err.stack);

    this.set('X-Content-Type-Options', 'nosniff');

    if (process.env.NODE_ENV == 'development') {
      renderDevError.call(this, err);
    } else {
      renderUserError.call(this, {status: 500, message: "Ошибка на стороне сервера"});
    }
  }
}

function renderValidationError(error) {
  /*jshint -W040 */
  this.status = 400;
  var errors = {};

  for (var field in error.errors) {
    errors[field] = error.errors[field].message;
  }

  this.body = {
    errors: errors
  };
}

module.exports = function(app) {

  app.use(function*(next) {
    this.renderError = renderError;
    this.renderValidationError = renderValidationError;

    try {
      yield* next;
    } catch (err) {
      this.renderError(err);
    }

  });

  // this middleware handles error BEFORE ^^^
  // rewrite mongoose wrong mongoose parameter -> 400 (not 500)
  app.use(function* rewriteCastError(next) {

    try {
      yield next;
    } catch (err) {

      if (err.name == 'CastError') {
        // malformed or absent mongoose params
        if (process.env.NODE_ENV != 'development') {
          this.throw(400);
        }
      }

      throw err;
    }

  });

};
