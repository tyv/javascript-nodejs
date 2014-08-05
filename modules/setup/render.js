'use strict';

const moment = require('moment');
const Parser = require('jade').Parser;
const util = require('util');
const path = require('path');
const config = require('config');
const fs = require('fs');
const log = require('js-log')();
const jade = require('jade');
const _ = require('lodash');
const assert = require('assert');
const JadeParserMultipleDirs = require('lib/jadeParserMultipleDirs');

log.debugOn();

function addStandardHelpers(locals, ctx) {
  locals.moment = moment;

  locals.parser = JadeParserMultipleDirs;

  // csrf only generated on request (leads to session generation)
  Object.defineProperty(locals, "csrf", {
    get: function() {
      var csrf = ctx.csrf;
      assert(csrf);
      return csrf;
    }
  });

  Object.defineProperty(locals, "user", {
    get: function() {
      return ctx.req.user;
    }
  });


  // this.locals.debug causes jade to dump function
  /* jshint -W087 */
  locals.deb = function() {
    debugger;
  };

}


// (!) this.render does not assign this.body to the result
// that's because render can be used for different purposes, e.g to send emails
module.exports = function render(app) {
  app.use(function *(next) {
    var ctx = this;

    this.locals = _.assign({}, config.template.options);
    addStandardHelpers(this.locals, ctx);

    this.templatePaths = [path.join(process.cwd(), 'templates')];

    // render('article', {})  -- 2 args
    // render('article')
    this.render = function(templatePath, locals) {

      log.debug("Lookup " + templatePath + " in " + this.templatePaths);

      // warning!
      // _.assign does NOT copy defineProperty
      // so I use this.locals as a root and merge all props in it, instead of cloning this.locals
      var loc = Object.create(this.locals);
      loc.templatePaths = this.templatePaths;

      _.assign(loc, locals);

      var templatePathResolved;
      for (var i = 0; i < this.templatePaths.length; i++) {
        templatePathResolved = path.join(this.templatePaths[i], templatePath);
        if (path.extname(templatePathResolved) === '') templatePathResolved  += '.jade';
        if (fs.existsSync(templatePathResolved)) break;
      }

      if (i == this.templatePaths.length) {
        throw new Error("Template file not found: " + templatePath + " (in dirs " + this.templatePaths + ") ");
      }

      log.debug("render file " + templatePathResolved);
      return jade.renderFile(templatePathResolved, loc);
    };


    yield next;
  });

};
