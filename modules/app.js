//require("time-require");

const config = require('config');

const Application = require('application');
var app = new Application();

if (process.env.NODE_ENV == 'production') {

  // only log.error in prod, otherwise just die
  process.on('uncaughtException', function(err) {
    // let bunyan handle the error
    app.log.error(err);
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

app.requireHandler('passport');

app.requireHandler('csrf');

app.requireHandler('paymentsMethods');

// Services that actually generate some stuff

app.requireHandler('frontpage');

if (process.env.NODE_ENV == 'development') {
  app.requireHandler('markup');
  app.requireHandler('dev');
}

app.requireHandler('users');

app.requireHandler('auth');

app.requireHandler('getpdf');
app.requireHandler('cache');
app.requireHandler('search');

app.requireHandler('profile');

app.requireHandler('currencyRate');
app.requireHandler('payments');

/*
 app.use(mount('/webmoney', compose([payment.middleware, require('webmoney').middleware])));
 app.csrfChecker.addIgnorePath('/webmoney/:any*');
 app.verboseLogger.addPath('/webmoney/:any*');

 app.use(mount('/yandexmoney', compose([payment.middleware, require('yandexmoney').middleware])));
 app.csrfChecker.addIgnorePath('/yandexmoney/:any*');
 app.verboseLogger.addPath('/yandexmoney/:any*');

 app.use(mount('/payanyway', compose([payment.middleware, require('payanyway').middleware])));
 app.csrfChecker.addIgnorePath('/payanyway/:any*');
 app.verboseLogger.addPath('/payanyway/:any*');

 app.use(mount('/paypal', compose([payment.middleware, require('paypal').middleware])));
 app.csrfChecker.addIgnorePath('/paypal/:any*');
 app.verboseLogger.addPath('/paypal/:any*');
 */

// stick to bottom to detect any not-yet-processed /:slug
app.requireHandler('tutorial');


app.requireHandler('404');

// uncomment for time-require to work
//process.emit('exit');

module.exports = app;


