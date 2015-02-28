const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');

exports.get = function*() {

  var quiz = yield Quiz.findOne({slug: this.params.slug}).exec();

  if (!quiz) {
    this.throw(404);
  }

  if (!this.session.quizzes) {
    this.redirect('/quiz');
    return;
  }

  // session may have many quiz at the same time
  // take the current one
  var sessionQuiz = this.session.quizzes[quiz.slug];

  if (!sessionQuiz) {
    this.redirect('/quiz');
    return;
  }

  var questionCurrent = sessionQuiz.questionCurrent;

  this.locals.headTitle = quiz.title;

  this.locals.quiz = quiz;
  this.locals.question = questionCurrent;

  this.locals.progressNow = sessionQuiz.questionsTaken.length + 1;
  this.locals.progressTotal = quiz.questionsToAskCount;

  console.log(questionCurrent);

  this.body = this.render('question');
};
