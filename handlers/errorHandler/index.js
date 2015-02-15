const config = require('config');
const escapeHtml = require('escape-html');
const _ = require('lodash');
const path = require('path');

var isDevelopment = process.env.NODE_ENV == 'development' && 0;

function renderUserError(error) {
  /*jshint -W040 */
  this.status = error.status || 500;
  this.message = error.message;

  var preferredType = this.accepts('html', 'json');

  if (preferredType == 'json') {
    this.body = _.pick(error, ['message','status','statusCode']);
  } else {
    var templateName = ~[500, 401, 404, 403].indexOf(error.status) ? error.status : 500;
    this.body = this.render(String(templateName), {error: error});
  }
}

function renderDevError(error) {
  /*jshint -W040 */
  this.status = 500;
  this.message = error.message;

  var preferredType = this.accepts('html', 'json');

  var stack = (error.stack || '')
    .split('\n').slice(1)
    .map(function(v) {
      return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>';
    }).join('');

  if (preferredType == 'json') {
    this.body = _.pick(error, ['message','status','statusCode']);
    this.body.stack = stack;
  } else {
    this.type = 'text/html; charset=utf-8';
    this.body = "<html><body><h1>" + error.message + "</h1><ul>" + stack + "</ul></body></html>";
  }

}

function renderError(err) {
  /*jshint -W040 */

  if (err.expose) {
    // user-level error

    // this.log.error({httpError: err});

    renderUserError.call(this, err);
  } else {

    // if error is "call stack too long", then log.error(err) is not verbose
    // so I cast it to string
    this.log.error(err.toString());
    this.log.error(err.stack);

    this.set('X-Content-Type-Options', 'nosniff');

    if (isDevelopment) {
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

exports.init = function(app) {

  app.use(function*(next) {
    this.renderError = renderError;
    this.renderValidationError = renderValidationError;

    try {
      this.templateDir = path.join(__dirname, 'templates');
      yield* next;
    } catch (err) {
      this.renderError(err);
    } finally {
      delete this.templateDir;
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
        if (!isDevelopment) {
          this.throw(400);
        }
      }

      throw err;
    }

  });

};
