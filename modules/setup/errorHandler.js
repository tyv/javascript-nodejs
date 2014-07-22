'use strict';

const config = require('config');
const log = require('js-log')();
const escapeHtml = require('escape-html');

function renderError(error) {
  /*jshint -W040 */
  this.status = error.status;

  var preferredType = this.accepts('html', 'json');

  if (preferredType == 'json') {
    this.body = error;
  } else {
    this.render("error", {error: error});
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
      .map(function(v){ return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>'; }).join('');

    this.type = 'text/html; charset=utf-8';
    this.body = "<html><body><h1>" + error.message + "</h1><ul>"+stack+ "</ul></body></html>";
  }

}

module.exports = function(app) {

  app.use(function*(next) {
    this.renderError = renderError;
    this.renderDevError = renderDevError;

    try {
      yield* next;
    } catch (err) {

      if (err.status) {
        // user-level error
        this.renderError(err);
      } else {

        // if error is "call stack too long", then log.error(err) is not verbose
        // so I cast it to string
        log.error(err.toString());
        log.error(err.stack);

        this.set('X-Content-Type-Options', 'nosniff');

        if (process.env.NODE_ENV == 'development') {
          this.renderDevError(err);
        } else {
          this.renderError({status: 500, message: "Internal Error"});
        }
      }
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
