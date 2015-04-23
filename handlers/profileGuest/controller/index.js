var config = require('config');
var User = require('users').User;
var mongoose = require('mongoose');
var QuizResult = require('quiz').QuizResult;

// skips the request if it's the owner
exports.get = function* (next) {

  var user = yield User.findOne({profileName: this.params.profileName}).exec();

  if (!user) {
    this.throw(404);
  }

  // the visitor is the owner => another middleware
  if (this.user && String(this.user._id) == String(user._id)) {
    yield* next;
    return;
  }

  this.locals.tabs = {
    aboutme: {
      url:   '/profile/' + user.profileName,
      title: 'Публичный профиль'
    }
  };


  var quizResults = yield* QuizResult.getLastAttemptsForUser(user._id);

  quizResults = quizResults.map(function(result) {
    return {
      created: result.created,
      quizTitle: result.quizTitle,
      score: result.score,
      level: result.level,
      levelTitle: result.levelTitle,
      quizUrl: result.quiz && result.quiz.getUrl(),
      time: result.time
    };
  });

  if (quizResults.length) {
    this.locals.tabs.quiz = {
      url: `/profile/${user.profileName}/quiz`,
      title: 'Тесты'
    };
  }
  this.locals.quizResults = quizResults;

  this.locals.title = user.displayName;

  var tabName = this.params.tab || 'aboutme';

  if (!this.locals.tabs[tabName]) {
    this.throw(404);
  }

  this.locals.tabs[tabName].active = true;

  this.body = this.render(tabName, {
    profileUser: user
  });

};

