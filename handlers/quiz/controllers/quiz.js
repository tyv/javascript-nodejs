const config = require('config');
const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');
const QuizStat = require('../models/quizStat');
const formatTitle = require('simpledownParser').formatTitle;
const renderSimpledown = require('renderSimpledown');

exports.get = function*() {

  this.nocache();

  // session may have many quiz at the same time
  // take the current one
  // it may be archived!
  var sessionQuiz = this.session.quizzes && this.session.quizzes[this.params.slug];

  if (!sessionQuiz) {
    // let the user start a new quiz here
    // not archived!
    var quiz = yield Quiz.findOne({
      slug: this.params.slug,
      archived: false
    }).exec();

    if (!quiz) {
      this.throw(404);
    }

    this.locals.quiz = quiz;
    this.locals.title = formatTitle(quiz.title);
    this.body = this.render('quiz-start');
    return;
  }

  // may be archived! (user started it before the update)
  var quiz = yield Quiz.findById(sessionQuiz.id).exec();

  if (!quiz) {
    this.throw(404);
  }

  this.locals.quiz = quiz;
  this.locals.title = formatTitle(quiz.title);

  this.log.debug("sessionQuiz", sessionQuiz);

  if (sessionQuiz.result) {

    var belowPercentage = yield QuizStat.getBelowScorePercentage(quiz.slug, sessionQuiz.result.quizScore);

    this.locals.quizResult = sessionQuiz.result;
    this.locals.quizBelowPercentage = belowPercentage;

    this.locals.quizQuestions = sessionQuiz.questionsTakenIds.map(function(id, num) {
      var question = quiz.questions.id(id).toObject();
      question.userAnswer = sessionQuiz.answers[num];
      question.correct = quiz.questions.id(id).checkAnswer(question.userAnswer);
      return question;
    });

    this.body = this.render('results');
  } else {
    // show current question
    this.locals.question = quiz.questions.id(sessionQuiz.questionCurrentId);

    this.locals.progressNow = sessionQuiz.questionsTakenIds.length + 1;
    this.locals.progressTotal = quiz.questionsToAskCount;

    console.log(this.locals);
    this.body = this.render('quiz');
  }
};
