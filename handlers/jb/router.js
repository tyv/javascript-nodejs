var Router = require('koa-router');

var index = require('./controllers/index');

var router = module.exports = new Router();

router.get('/', index.get);
router.post('/', index.post);

var JbGoStat = require('./models/jbGoStat');
router.get('/go', function*() {

  yield JbGoStat.create({
    ip: this.request.ips
  });


  this.status = 301;
  this.redirect('https://www.jetbrains.com/webstorm/?utm_source=javascript.ru&utm_medium=banner2&utm_campaign=webstorm');
});
