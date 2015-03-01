const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');
const formatTitle = require('simpledownParser').formatTitle;

exports.get = function*() {

  this.nocache();

  if (!this.session.quizzes) {
    this.redirect('/quiz');
    return;
  }

  // session may have many quiz at the same time
  // take the current one
  var sessionQuiz = this.session.quizzes[this.params.slug];

  if (!sessionQuiz) {
    this.redirect('/quiz');
    return;
  }

  var quiz = yield Quiz.findById(sessionQuiz.id).exec();

  if (!quiz) {
    this.throw(404);
  }

  if (sessionQuiz.result) {
    // TODO: show result
  } else {
    // show current question
    var questionCurrent = sessionQuiz.questionCurrent;

    this.locals.title = formatTitle(quiz.title);

    this.locals.quiz = quiz;
    this.locals.question = questionCurrent;

    this.locals.progressNow = sessionQuiz.questionsTaken.length + 1;
    this.locals.progressTotal = quiz.questionsToAskCount;

    this.body = this.render('quiz');
  }
};
