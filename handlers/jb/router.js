var Router = require('koa-router');

var index = require('./controllers/index');

var router = module.exports = new Router();

router.get('/', index.get);
router.post('/', index.post);

var JbGoStat = require('./models/jbGoStat');
router.get('/go', function*() {

  yield JbGoStat.create({
    ip: this.request.ip,
    referer: this.get('referer'),
    cookie: this.get('cookie')
  });

  this.status = 301;
  this.redirect('http://www.jetbrains.com/webstorm/?utm_source=javascript.ru&utm_medium=banner&utm_content=webstormge&utm_campaign=webstorm');
  //this.redirect('https://ad.doubleclick.net/ddm/jump/N3643.1915072JAVASCRIPT.RU/B8253346.111523141;sz=200x200;ord=[timestamp]?');
});

