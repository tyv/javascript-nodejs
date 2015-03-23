const config = require('config');
const escapeHtml = require('escape-html');
const _ = require('lodash');
const path = require('path');

var isDevelopment = process.env.NODE_ENV == 'development' && 0;


function renderError(err) {
  /*jshint -W040 */
  this.set('X-Content-Type-Options', 'nosniff');

  // don't pass just err, because for "stack too deep" errors it leads to logging problems
  this.log.error({
    message: err.message,
    stack: err.stack,
    errors: err.errors, // for validation errors
    status: err.status,
    referer: this.get('referer'),
    cookie: this.get('cookie')
  });

  var preferredType = this.accepts('html', 'json');

  if (err.name == 'ValidationError') {
    this.status = 400;

    if (preferredType == 'json') {
      var errors = {};

      for (var field in err.errors) {
        errors[field] = err.errors[field].message;
      }

      this.body = {
        errors: errors
      };
    } else {
      this.body = this.render("400", {error: err});
    }

    return;
  }

  if (isDevelopment) {
    this.status = err.status || 500;

    var stack = (err.stack || '')
      .split('\n').slice(1)
      .map(function(v) {
        return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>';
      }).join('');

    if (preferredType == 'json') {
      this.body = {
        message: err.message,
        stack: stack
      };
      this.body.statusCode = err.statusCode || err.status;
    } else {
      this.type = 'text/html; charset=utf-8';
      this.body = "<html><body><h1>" + err.message + "</h1><ul>" + stack + "</ul></body></html>";
    }

    return;
  }

  this.status = err.expose ? err.status : 500;

  if (preferredType == 'json') {
    this.body = {
      message: err.message,
      statusCode: err.status || err.statusCode
    };
    if (err.description) {
      this.body.description = err.description;
    }
  } else {
    var templateName = ~[500, 401, 404, 403].indexOf(this.status) ? this.status : 500;
    this.body = this.render(String(templateName), {error: err});
  }

}


exports.init = function(app) {

  app.use(function*(next) {
    this.renderError = renderError;

    try {
      yield* next;
    } catch (err) {
      // this middleware is not like others, it is not endpoint
      // so wrapHmvcMiddleware is of little use
      this.templateDir = path.join(__dirname, 'templates');
      this.renderError(err);
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
