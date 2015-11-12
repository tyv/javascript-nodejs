'use strict';

const moment = require('momentWithLocale');
const util = require('util');
const path = require('path');
const config = require('config');
const fs = require('fs');
const log = require('log')();
const jade = require('lib/serverJade');
const _ = require('lodash');
const assert = require('assert');
const i18n = require('i18next');
const money = require('money');
const url = require('url');
const validate = require('validate');
const pluralize = require('textUtil/pluralize');

// public.versions.json is regenerated and THEN node is restarted on redeploy
// so it loads a new version.
var publicVersions;

function getPublicVersion(publicPath) {
  if (!publicVersions) {
    // don't include at module top, let the generating task to finish
    publicVersions = require(path.join(config.projectRoot, 'public.versions.json'));
  }
  var busterPath = publicPath.slice(1);
  return publicVersions[busterPath];
}

function addStandardHelpers(locals, ctx) {
  // same locals may be rendered many times, let's not add helpers twice
  if (locals._hasStandardHelpers) return;

  locals.moment = moment;

  locals._ = _;

  locals.lang = config.lang;

  locals.url = url.parse(ctx.protocol + '://' + ctx.host + ctx.originalUrl);
  locals.context = ctx;

  locals.analyticsEnabled = ctx.query.noa ? false : (ctx.host == config.domain.main && process.env.NODE_ENV == 'production');

  locals.js = function(name, options) {
    options = options || {};

    let src = locals.pack(name, 'js');

    let attrs = options.defer ? ' defer' : '';

    return `<script>
      if (~navigator.userAgent.toLowerCase().indexOf('firefox')) document.write('<script src="${src}" type="application/javascript;version=1.8"${attrs}><\\/script>');
      else document.write('<script src="${src}"${attrs}><\\/script>');
      </script>
    `;
  };


  locals.css = function(name) {
    let src = locals.pack(name, 'css');

    return `<link href="${src}" rel="stylesheet">`;
  };

  // we don't use defer in sessions, so can assign it
  // (simpler, need to call yield this.session)
  locals.session = ctx.session;


  locals.env = process.env;

  locals.pluralize = pluralize;
  locals.domain = config.domain;
  locals.ga = config.ga;
  locals.yandexMetrika = config.yandexMetrika;



  // patterns to use in urls
  // no need to escape /
  // \s => \\s
  locals.validate = {
    patterns: {}
  };
  for(var name in validate.patterns) {
    locals.validate.patterns[name] = validate.patterns[name].source.replace(/\\\//g, '/');
  }

  // replace lone surrogates in json, </script> -> <\/script>
  locals.escapeJSON = function(s) {
    var json = JSON.stringify(s);
    return json.replace(/\//g, '\\/')
      .replace(/[\u003c\u003e]/g,
      function(c) {
        return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4).toUpperCase();
      }
    ).replace(/[\u007f-\uffff]/g,
      function(c) {
        return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
      }
    );
  };

  Object.defineProperty(locals, "user", {
    get: function() {
      return ctx.req.user;
    }
  });

  locals.profileTabNames = {
    quiz: 'Тесты',
    orders: 'Заказы',
    courses: 'Курсы',
    aboutme: 'Публичный профиль',
    subscriptions: 'Уведомления',
    account: 'Аккаунт'
  };

  // flash middleware may be attached later in the chain
  Object.defineProperty(locals, "flashMessages", {
    get: function() {
      return ctx.flash && ctx.flash.messages;
    }
  });

  var renderSimpledown;
  Object.defineProperty(locals, "renderSimpledown", {
    get: function() {
      if (!renderSimpledown) {
        renderSimpledown = require('renderSimpledown');
      }
      return renderSimpledown; // attach at 1st use
    }
  });


  locals.renderParagraphsAndLinks = require('renderParagraphsAndLinks');

  locals.csrf = function() {
    // function, not a property to prevent autogeneration
    // jade touches all local properties
    return ctx.user ? ctx.csrf : null;
  };

  // this.locals.debug causes jade to dump function
  /* jshint -W087 */
  locals.deb = function() {
    debugger;
  };

  locals.t = i18n.t;
  locals.bem = require('bem-jade')();

  locals.thumb = function(url, width, height) {
    // return 2 times larger image for retina
    var modifier = (width < 320 && height < 320) ? 't' :
      (width < 640 && height < 640) ? 'm' :
        (width < 1280 && height < 1280) ? 'l' : '';

    return url.slice(0, url.lastIndexOf('.')) + modifier + url.slice(url.lastIndexOf('.'))
  };

  locals.currencyConvertRound = function(amount, from, to) {
    return Math.round(money.convert(amount, {from: from, to: to}));
  };


  locals.pack = function(name, ext) {
    var versions = JSON.parse(
      fs.readFileSync(path.join(config.manifestRoot, 'pack.versions.json'), {encoding: 'utf-8'})
    );
    var versionName = versions[name];
    // e.g style = [ style.js, style.js.map, style.css, style.css.map ]

    if (!Array.isArray(versionName)) return versionName;

    var extTestReg = new RegExp(`.${ext}\\b`);

    // select right .js\b extension from files
    for (var i = 0; i < versionName.length; i++) {
      var versionNameItem = versionName[i]; // e.g. style.css.map
      if (/\.map/.test(versionNameItem)) continue; // we never need a map
      if (extTestReg.test(versionNameItem)) return versionNameItem;
    }

    throw new Error(`Not found pack name:${name} ext:${ext}`);
    /*
    if (process.env.NODE_ENV == 'development') {
      // webpack-dev-server url
      versionName = process.env.STATIC_HOST + ':' + config.webpack.devServer.port + versionName;
    }*/

  };



  locals._hasStandardHelpers = true;
}


// (!) this.render does not assign this.body to the result
// that's because render can be used for different purposes, e.g to send emails
exports.init = function(app) {
  app.use(function *(next) {
    var ctx = this;

    var renderFileCache = {};

    this.locals = _.assign({}, config.jade);

    /**
     * Render template
     * Find the file:
     *   if locals.useAbsoluteTemplatePath => use templatePath
     *   else if templatePath starts with /   => lookup in locals.basedir
     *   otherwise => lookup in this.templateDir (MW should set it)
     * @param templatePath file to find (see the logic above)
     * @param locals
     * @returns {String}
     */
    this.render = function(templatePath, locals) {

      // add helpers at render time, not when middleware is used time
      // probably we will have more stuff initialized here
      addStandardHelpers(this.locals, this);

      // warning!
      // _.assign does NOT copy defineProperty
      // so I use this.locals as a root and merge all props in it, instead of cloning this.locals
      var loc = Object.create(this.locals);

      _.assign(loc, locals);

      if (!loc.schema) {
        loc.schema = {};
      }


      if (!loc.canonicalPath) {
        // strip query
        loc.canonicalPath = this.request.originalUrl.replace(/\?.*/, '');
        // /intro/   -> /intro
        loc.canonicalPath = loc.canonicalPath.replace(/\/+$/, '');
      }

      loc.canonicalUrl = config.server.siteHost + loc.canonicalPath;

      loc.disqusDomain = config.disqus.domain;

      var templatePathResolved = resolvePath(templatePath, loc);
      this.log.debug("render file " + templatePathResolved);
      return jade.renderFile(templatePathResolved, loc);
    };

    function resolvePath(templatePath, options) {
      var cacheKey = templatePath + ":" + options.useAbsoluteTemplatePath;

      if (renderFileCache[cacheKey]) {
        return renderFileCache[cacheKey];
      }

      // first we try template.en.jade
      // if fails then template.jade
      var templatePathWithLangAndExt = templatePath + '.' + config.lang;
      if (!/\.jade$/.test(templatePathWithLangAndExt)) {
        templatePathWithLangAndExt += '.jade';
      }


      var templatePathResolved;
      if (options.useAbsoluteTemplatePath) {
        templatePathResolved = templatePathWithLangAndExt;
      } else {
        if (templatePath[0] == '/') {
          ctx.log.debug("Lookup " + templatePathWithLangAndExt + " in " + options.basedir);
          templatePathResolved = path.join(options.basedir, templatePathWithLangAndExt);
        } else {
          ctx.log.debug("Lookup " + templatePathWithLangAndExt + " in " + ctx.templateDir);
          templatePathResolved = path.join(ctx.templateDir, templatePathWithLangAndExt);
        }
      }

      if (!fs.existsSync(templatePathResolved)) {
        templatePathResolved = templatePathResolved.replace(`.${config.lang}.jade`, '.jade');
      }

      renderFileCache[cacheKey] = templatePathResolved;

      return templatePathResolved;
    }

    yield* next;
  });

};
