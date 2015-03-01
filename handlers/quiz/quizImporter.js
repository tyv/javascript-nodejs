var yaml = require('js-yaml');
var fs = require('fs');
var Quiz = require('./models/quiz');
var path = require('path');

function QuizImporter(options) {
  this.root = fs.realpathSync(options.root);


}

QuizImporter.prototype.import = function*() {

  var quizObj = yaml.safeLoad(fs.readFileSync(this.root, 'utf8'));

  var quiz = new Quiz(quizObj);
  quiz.archived = false;

  yield Quiz.update({
    slug: quiz.slug
  }, {
    $set: {
      archived: true
    }
  }).exec();

  try {
    yield quiz.persist();
  } catch (e) {
    if (e.errors) console.error(e.errors);
    throw e;
  }

};


module.exports = QuizImporter;