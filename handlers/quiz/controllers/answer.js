const Quiz = require('../models/quiz');
const QuizResult = require('../models/quizResult');
const QuizQuestion = require('../models/quizQuestion');
const _ = require('lodash');

exports.post = function*() {

  if (!this.session.quizzes) {
    this.log.debug("No session quizzes");
    this.throw(404);
  }

  var sessionQuiz = this.session.quizzes[this.params.slug];

  if (!sessionQuiz) {
    this.log.debug("No session quiz with such slug");
    this.throw(404);
  }

  var quiz = yield Quiz.findById(sessionQuiz.id).exec();

  if (!quiz) {
    this.log.debug("No quiz with id " + sessionQuiz.id);
    this.throw(404);
  }

  // save selected answers in the question and push to questionsTaken
  var question = sessionQuiz.questionCurrent;

  // type is not same, maybe question was renewed?
  if (this.request.body.type != question.type) {
    this.log.debug("Wrong type", this.request.body.type, question);

    this.throw(404);
  }

  sessionQuiz.questionsTaken.push(question);
  sessionQuiz.answers.push(this.request.body.answer);

  if (sessionQuiz.questionsTaken.length == quiz.questionsToAskCount) {

    var totalScore = 0;
    sessionQuiz.questionsTaken.forEach(function(question, i) {
      question = new QuizQuestion(question);
      totalScore += question.getAnswerScore(sessionQuiz.answers[i]);
    });

    var quizResult = new QuizResult({
      user: this.user,
      quizSlug: quiz.slug,
      quizTitle: quiz.title,
      quizScore: totalScore,
      quizTime: Date.now() - sessionQuiz.started
    });

    sessionQuiz.result = quizResult.toObject();

    this.body = {
      reload: true
    };

  } else {

    // select one more question among non-taken
    var questionsAvailable = quiz.questions.filter(function(question) {
      // if a quiz.question is taken, exclude it from the list
      var found = false;
      sessionQuiz.questionsTaken.forEach(function(q) {
        if (String(q._id) == String(question._id)) found = true;
      });

      return !found;
    });

    sessionQuiz.questionCurrent = _.sample(questionsAvailable, 1)[0].toObject();

    this.locals.question = sessionQuiz.questionCurrent;

    this.body = {
      html: this.render('partials/_question'),
      questionNumber: sessionQuiz.questionsTaken.length
    };


  }

};
