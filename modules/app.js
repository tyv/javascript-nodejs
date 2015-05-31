//require("time-require");

const fs = require('fs');
const config = require('config');

require('cls'); // init CLS namespace once, handler used below

const Application = require('application');
const app = new Application();


if (process.env.NODE_ENV != 'development') {

  // only log.error in prod, otherwise just die
  process.on('uncaughtException', function(err) {
    // let bunyan handle the error
    app.log.error({
      message: err.message,
      name:    err.name,
      errors:  err.errors,
      stack:   err.stack
    });
    process.exit(255);
  });

}


// The app is always behind Nginx which serves static
// (Maybe behind Cloudflare as well)
// trust all headers from the proxy
// X-Forwarded-Host
// X-Forwarded-Proto
// X-Forwarded-For -> ip
app.proxy = true;

// ========= Helper handlers ===========
app.requireHandler('cls');

app.use(function*(next) {
  this.countryCode = (this.get('cf-ipcountry') || this.get('x-nginx-geo') || '').toLowerCase();
  if (this.countryCode == 'xx') this.countryCode = ''; // CloudFlare cannot detect country
  yield* next;
});

app.requireHandler('mongooseHandler');

app.requireHandler('requestId');
app.requireHandler('requestLog');

app.requireHandler('nocache');

//app.requireHandler('time');

// this middleware adds this.render method
// it is *before errorHandler*, because errors need this.render
app.requireHandler('render');

// errors wrap everything
app.requireHandler('errorHandler');

// this logger only logs HTTP status and URL
// before everything to make sure it log all
app.requireHandler('accessLogger');

// before anything that may deal with body
// it parses JSON & URLENCODED FORMS,
// it does not parse form/multipart
app.requireHandler('bodyParser');

// parse FORM/MULTIPART
// (many tweaks possible, lets the middleware decide how to parse it)
app.requireHandler('multipartParser');

// right after parsing body, make sure we logged for development
app.requireHandler('verboseLogger');

if (process.env.NODE_ENV == 'development') {
//  app.verboseLogger.addPath('/:any*');
}

app.requireHandler('conditional');

app.requireHandler('session');

app.requireHandler('passportSession');

app.requireHandler('passportRememberMe');

app.requireHandler('lastActivity');

app.requireHandler('csrf');

app.requireHandler('flash');

app.requireHandler('paymentsMethods');

// ======== Endpoint services that actually generate something ==========

var endpoints = [];

if (process.env.NODE_ENV == 'development') {
  endpoints.push('markup', 'dev');
}

endpoints.push(
  'users', 'auth', 'ebook', 'cache', 'search', 'profile', 'jb', 'play', 'nodejsScreencast', 'about', 'imgur',
  'profileGuest', 'quiz', 'currencyRate', 'payments', 'download', 'staticPage', 'newsletter', 'mailer', 'courses'
);


endpoints.forEach(function(name) {
  app.requireHandler(name);
});


if (fs.existsSync(config.extraHandlersRoot)) {
  fs.readdirSync(config.extraHandlersRoot).forEach(function(extraHandler) {
    if (extraHandler[0] == '.') return;
    app.requireHandler(extraHandler);
  });
}

// stick to bottom to detect any not-yet-processed /:slug
app.requireHandler('tutorial');

// must be last
app.requireHandler('404');

// uncomment for time-require to work
//process.emit('exit');

module.exports = app;


