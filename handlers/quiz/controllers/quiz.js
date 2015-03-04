const config = require('config');
const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');
const QuizStat = require('../models/quizStat');
const formatTitle = require('simpledownParser').formatTitle;
const renderSimpledown = require('renderSimpledown');

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

    var belowPercentage = yield QuizStat.getBelowScorePercentage(quiz.slug, sessionQuiz.result.quizScore);

    this.locals.quizResult = sessionQuiz.result;
    this.locals.quizBelowPercentage = belowPercentage;

    this.locals.quizQuestions = sessionQuiz.questionsTakenIds.map(function(id, num) {
      var question = quiz.questions.id(id).toObject();
      question.userAnswer = sessionQuiz.answers[num];
      question.correct = quiz.questions.id(id).getAnswerScore(question.userAnswer);
      question.contentRendered = renderSimpledown(question.content);
      return question;
    });

    this.locals.title = formatTitle(quiz.title);

    this.body = this.render('results');
  } else {
    // show current question
    var questionCurrent = quiz.questions.id(sessionQuiz.questionCurrentId);

    this.locals.title = formatTitle(quiz.title);

    this.locals.quiz = quiz;
    this.locals.question = questionCurrent;

    this.locals.question.contentRendered = renderSimpledown(questionCurrent.content);

    this.locals.progressNow = sessionQuiz.questionsTakenIds.length + 1;
    this.locals.progressTotal = quiz.questionsToAskCount;

    this.body = this.render('quiz');
  }
};
