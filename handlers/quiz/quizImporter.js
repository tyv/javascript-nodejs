var yaml = require('js-yaml');
var fs = require('fs');
var Quiz = require('./models/quiz');
var path = require('path');

function QuizImporter(options) {
  this.fileContent = fs.realpathSync(options.yml);
}


QuizImporter.prototype.addDot = function(question) {
  var question = question.trim();
  if (!/[.!?)]$/.test(question)) {
    question += '.';
  }
  return question;
};

QuizImporter.prototype.import = function*() {

  var quizObj = yaml.safeLoad(fs.readFileSync(this.fileContent, 'utf8'));

  /*
  for (var i = 0; i < quizObj.questions.length; i++) {
    var questions = quizObj.questions[i];
    console.log("HERE");

    for (var j = 0; j < questions.length; j++) {
      questions[j] = this.addDot(questions[j]);
    }

  }*/

  for (var i = 0; i < quizObj.questions.length; i++) {
    var question = quizObj.questions[i];

    for (var j = 0; j < question.answers.length; j++) {
      var answer = question.answers[j];
      if (typeof answer == 'string') {
        question.answers[j] = { title: answer };
      }
    }

  }


  var quiz = new Quiz(quizObj);

  quiz.archived = false;

  yield Quiz.update({
    slug: quiz.slug
  }, {
    $set: {
      archived: true
    }
  }, {
    multi: true
  }).exec();

  try {
    yield quiz.persist();
  } catch (e) {
    if (e.errors) console.error(e.errors);
    throw e;
  }

};


module.exports = QuizImporter;