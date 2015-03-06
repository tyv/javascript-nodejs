const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');

exports.get = function*() {

  this.nocache();

/*
  - quiz.list = []
  - quiz.list.push({ title: 'Основной Javascript', description: 'В тест включены вопросы по взаимодействию Javascript, DOM HTML, по синтаксису языка', url: '/123' })
  - quiz.list.push({ title: 'Особенности и фишки Javascript', description: 'Особенности Javascript по сравнению с другими языками. Трюки и фишки DOM, браузеров', url: '/123', result: '42%' })
  - quiz.list.push({ title: 'Коммуникация с сервером, AJAX, XMLHttpRequest', description: 'Различные аспекты работы с сервером из Javascript, транспорты и технологии', url: '/123' })
*/
  var quizzes = yield Quiz.find({
    archived: false
  }).exec();

  this.locals.quizzes = [];

  this.locals.title = 'Тестирование знаний';

  var quizResults = [];
  if (this.user) {
    quizResults = yield QuizResult.find({
      user: this.user._id
    }).exec();
  }

  for (var i = 0; i < quizzes.length; i++) {
    var quiz = quizzes[i];
    var q = {
      title: quiz.title,
      description: quiz.description,
      slug: quiz.slug
    };
    quizResults.forEach(function(quizResult) {
      if (quizResult.slug == quiz.slug) {
        q.quizResultScore = quizResult.quizScore;
      }
    });

    this.locals.quizzes.push(q);
  }

  this.body = this.render('index');
};
