///*
//const Parser = require('jade').Parser;
//const util = require('util');
//const path= require('path');
//const config= require('config');
//const fs = require('fs');
//const log = require('javascript-log')(module);
//const jade = require('jade');
//const thunkify = require('thunkify');
//const _ = require('lodash');
//
//log.debugOn();
//
//module.exports = function(template, locals) {
//  var ctx = this;
//
//  function JadeParser(str, filename, options) {
//    Parser.apply(this, arguments);
//  }
//  util.inherits(JadeParser, Parser);
//
//  JadeParser.prototype.resolvePath = function(templateFile, purpose) {
//    //console.log("!!!!!!! ", path);
//
//    if (templateFile[0] == '.') {
//      templateFile = path.join(path.dirname(this.filename), templateFile) + '.jade';
//      //console.log("Resolve to ", path);
//      return templateFile;
//    }
//
//    return resolvePath(templateFile);
//  };
//
//
//  function resolvePath(templateFile) {
//    var templateDirs = ctx.templateDirs;
//    for (var i = 0; i < templateDirs.length; i++) {
//      var templateDir = templateDirs[i];
//      var template = path.join(templateDir, templateFile + '.jade');
//      if (fs.existsSync(template)) {
//        return template;
//      }
//    }
//    return null;
//  }
//
//
//  var loc = _.assign({parser: JadeParser}, config.template.options, this.locals, locals)
//
//  jade.renderFile(resolvePath(template), loc);
//
//
//};
//
//*/
///*
//module.exports = function(dir) {
//
//  function JadeParser(str, filename, options) {
//    Parser.apply(this, arguments);
//  }
//  util.inherits(JadeParser, Parser);
//
//  JadeParser.prototype.resolvePath = JadeParser.resolvePath = function(path, purpose) {
//    //console.log("!!!!!!! ", path);
//
//    if (path[0] == '.') {
//
//      path = pathModule.join(pathModule.dirname(this.filename), path) + '.jade';
//      //console.log("Resolve to ", path);
//      return path;
//    }
//
//    var templateRoot = pathModule.resolve(dir);
//    var top = pathModule.resolve(process.cwd());
//
//    //console.log("Look from ", templateRoot, "to", top);
//    while (templateRoot != pathModule.dirname(top)) {
//      var template = pathModule.join(templateRoot, 'template', path + '.jade');
//      //log.debug("-- try path", template);
//      if (fs.existsSync(template)) {
//      //  log.debug("-- found");
//        return template;
//      }
//     // log.debug("-- skipped");
//      templateRoot = pathModule.dirname(templateRoot);
//    }
//
// //   log.debug("-- end", templateRoot, top);
//  };
//
//
//  return JadeParser;
//
//
//};
//*//*
//
