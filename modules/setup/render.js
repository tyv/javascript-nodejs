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

//log.debugOn();

// (!) this.render does not assign this.body to the result
// that's because render can be used for different purposes, e.g to send emails
module.exports = function render(app) {
  app.use(function *(next) {
    var ctx = this;

    this.locals = _.assign({}, config.template.options);
    this.locals.moment = moment;

    // warning!
    // _.assign does NOT copy defineProperty
    Object.defineProperty(this.locals, "csrf", {
      get: function() {
        var csrf = ctx.csrf;
        assert(csrf);
        return csrf;
      }
    });

    // warning!
    // _.assign does NOT copy defineProperty
    Object.defineProperty(this.locals, "user", {
      get: function() {
        return ctx.req.user;
      }
    });


    // this.locals.debug causes jade to dump function
    /* jshint -W087 */
    this.locals.deb = function() {
      debugger;
    };

    // render(__dirname, 'article', {}) -- 3 args
    // render(__dirname, 'article') -- 2 args
    // render('article', {})  -- 2 args
    // render('article')
    this.render = function(templateDir, templatePath, locals) {
      if (arguments.length == 2) {
        if (typeof templatePath == 'object') {
          templatePath = arguments[0];
          templateDir = process.cwd();
          locals = arguments[1];
        } else {
          locals = {};
        }
      }

      if (arguments.length == 1) {
        locals = {};
        templateDir = process.cwd();
      }

      // this jade parser knows templateDir through closure
      function JadeParser(str, filename, options) {
        Parser.apply(this, arguments);
      }

      util.inherits(JadeParser, Parser);

      JadeParser.prototype.resolvePath = function(templatePath, purpose) {

        if (templatePath[0] == '.') {
          if (!this.filename) {
            throw new Error('the "filename" option is required to use "' + purpose + '" with "relative" paths');
          }

          // files like article.html are included in a special way (Filter)
          templatePath = path.join(path.dirname(this.filename), templatePath) + (path.extname(templatePath) ? '' : '.jade');
          //console.log("Resolve to ", path);
          return templatePath;
        }

        log.debug("resolvePathUp " + templateDir + " " + templatePath);

        return resolvePathUp(templateDir, templatePath + '.jade');
      };

      var loc = Object.create(this.locals);

      var parseLocals = {
        parser:   JadeParser
      };

      _.assign(loc, parseLocals, locals);

//      console.log(loc);
      var file = resolvePathUp(templateDir, templatePath + '.jade');
      if (!file) {
        throw new Error("Template file not found: " + templatePath + " (in dir " + templateDir + ") ");
      }
      log.debug("render file " + file);
      return jade.renderFile(file, loc);
    };


    yield next;
  });

};

function resolvePathUp(templateDir, templateName) {

  templateDir = path.resolve(templateDir);
  var top = path.resolve(process.cwd());

  while (templateDir != path.dirname(top)) {
    var template = path.join(templateDir, 'templates', templateName);
    log.debug("-- try path", template);
    if (fs.existsSync(template)) {
      log.debug("-- found");
      return template;
    }
    log.debug("-- skipped");
    templateDir = path.dirname(templateDir);
  }

  log.debug("-- failed", templateDir, top);
  return null;
}
