//require("time-require");

const config = require('config');

const Application = require('application');
var app = new Application();

if (process.env.NODE_ENV != 'development') {

  // only log.error in prod, otherwise just die
  process.on('uncaughtException', function(err) {
    // let bunyan handle the error
    app.log.error({
      message: err.message,
      name: err.name,
      errors: err.errors,
      stack: err.stack
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

app.requireHandler('mongooseHandler');

app.requireHandler('requestId');
app.requireHandler('requestLog');

app.requireHandler('nocache');

/*
 app.id = Math.random();
 app.use(function*(next) {
 console.log(app.id);
 yield next;
 });
 */

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

//app.requireHandler('sendMail');

// right before endpoints
// so that the error won't fall through the handlers above
// all above ^^^ handlers can finish processing the usual way
//app.requireHandler('throwFinish');

// ======== Endpoint services that actually generate something ==========

var endpoints = [];

if (process.env.NODE_ENV == 'development') {
  endpoints.push('markup', 'dev');
}

endpoints.push(
  'users', 'auth', 'frontpage', 'ebook', 'cache', 'search', 'profile', 'jb', 'play', 'nodejsScreencast', 'about',
  'profileGuest', 'quiz', 'currencyRate', 'payments', 'download', 'staticPage', 'newsletter', 'mailer', 'courses'
);

// stick to bottom to detect any not-yet-processed /:slug
endpoints.push('tutorial');

endpoints.push('404');

endpoints.forEach(function(name) {
  app.requireHandler(name);
});

require('fs').readdirSync(config.extraHandlersRoot).forEach(function(extraHandler) {
  if (extraHandler[0] == '.') return;
  app.requireHandler(extraHandler);
});

// uncomment for time-require to work
//process.emit('exit');

module.exports = app;


