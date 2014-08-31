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

// public.md5.json is regenerated and THEN node is restarted on redeploy
// so it loads a new version.
var publicMd5 = require(path.join(config.projectRoot, 'public.md5.json'));

function addStandardHelpers(locals, ctx) {
  locals.moment = moment;

  locals.parser = JadeParserMultipleDirs;

  // csrf only generated on request
  Object.defineProperty(locals, "csrf", {
    get: function() {
      var csrf = ctx.csrf;
      assert(csrf);
      return csrf;
    }
  });

  // we don't use defer in sessions, so can assign it
  // (simpler, need to call yield this.session)
  // (anon users may stop on varnish anyway)
  locals.session = ctx.session;

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

  locals.bem = require('bem-jade')();

  locals.addFileMd5 = function(publicPath) {
    if (publicPath[0] != '/') {
      throw new Error("addFileMd5 needs an /absolute/path");
    }
    var busterPath = publicPath.slice(1);
    var md5 = publicMd5[busterPath];
    if (!md5) {
      throw new Error("No md5 for " + publicPath);
    }
    return publicPath + '?r=' + md5;
  };

//  locals.debug = true;
}


// (!) this.render does not assign this.body to the result
// that's because render can be used for different purposes, e.g to send emails
module.exports = function render(app) {
  app.use(function *(next) {
    var ctx = this;

    this.locals = _.assign({}, config.template.options);

    this.templatePaths = [path.join(config.projectRoot, 'templates')];

    // render('article', {})  -- 2 args
    // render('article')
    this.render = function(templatePath, locals) {

      // add helpers at render time, not when middleware is used time
      // probably we will have more stuff initialized here
      addStandardHelpers(this.locals, this);

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
