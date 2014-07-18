'use strict';

const moment = require('moment');
const Parser = require('jade').Parser;
const util = require('util');
const path= require('path');
const config= require('config');
const fs = require('fs');
const log = require('javascript-log')(module);
const jade = require('jade');
const _ = require('lodash');

//log.debugOn();

module.exports = function render(app) {
  app.use(function *(next) {

    this.locals = { };

    this.locals.moment = moment;

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
          templatePath = path.join(path.dirname(this.filename), templatePath) + '.jade';
          //console.log("Resolve to ", path);
          return templatePath;
        }

        return resolvePathUp(templateDir, templatePath + '.jade');
      };

      var serviceLocals = {
        parser: JadeParser,
        readFile: function(file) {
          if (file[0] == '.') {
            throw new Error("readFile file must not start with . : bad file " + file);
          }
          var path = resolvePathUp(templateDir, file);
          if (!path) {
            throw new Error("Not found " + file + " (from dir " + templateDir + ")");
          }
          return fs.readFileSync(path);
        }
      };
      var loc = _.assign(serviceLocals, config.template.options, this.locals, locals);

//      console.log(loc);
      var file = resolvePathUp(templateDir, templatePath + '.jade');
      if (!file) {
        throw new Error("Template file not found: " + templatePath + " (in dir " + templateDir + ") ");
      }
      this.body = jade.renderFile(file, loc);
    };


    yield next;
  });

};

function resolvePathUp(templateDir, templateName) {

  templateDir = path.resolve(templateDir);
  var top = path.resolve(process.cwd());

  while (templateDir != path.dirname(top)) {
    var template = path.join(templateDir, 'template', templateName);
    log.debug("-- try path", template);
    if (fs.existsSync(template)) {
      log.debug("-- found");
      return template;
    }
    log.debug("-- skipped");
    templateDir = path.dirname(templateDir);
  }

  log.debug("-- failed", templateRoot, top);
  return null;
}
