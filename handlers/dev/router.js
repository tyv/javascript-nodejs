var Router = require('koa-router');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Article = require('tutorial').Article;
var _ = require('lodash');

var router = module.exports = new Router();

router.get('/user', function*() {
  var User = require('users').User;

  var user = new User({
    email:       'mk@abc.ru',
    gender:      'male',
    displayName: 'Tester2'
  });

  try {
    mongoose.Types.ObjectId("51bb793aca2ab77a3200000d");

    var user = yield User.findById('blabla', function(err, res) {
      console.log(arguments);
    });

  } catch (e) {
    console.log(e.errors);
  }

});

router.get('/die', function*() {
  setTimeout(function() {
    throw new Error("die");
  }, 10);
});

var d = new Date() + '';

router.get('/test', function*() {
  this.body = '<script src="/js/head.js"></script><script src="/js/mom.js"></script>';
});

