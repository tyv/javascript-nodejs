var Spinner = require('client/spinner');
var xhr = require('client/xhr');

function init() {
  var quizQuestionForm = document.querySelector('[data-quiz-question-form]');

  if (quizQuestionForm) {
    initQuizForm(quizQuestionForm);
  }
}

function initQuizForm(form) {

  function getValue() {
    var answerElems = form.elements.answer;

    var value = [];

    for (var i = 0; i < answerElems.length; i++) {
      if (answerElems[i].checked) value.push(answerElems[i].value);
    }

    return value;
  }

  form.onchange = function() {
    var value = getValue();

    form.querySelector('[type="submit"]').disabled = value.length ? false : true;
  };

  form.onsubmit = function(event) {
    event.preventDefault();
    var value = getValue();

    var request = xhr({
      method: 'POST',
      url:    form.action,
      body:   {
        answer: value,
        type:   form.elements.type.value
      }
    });

    var submitButton = form.querySelector('[type="submit"]');

    var spinner = new Spinner({
      elem:      submitButton,
      size:      'small',
      elemClass: 'button_loading'
    });
    spinner.start();
    submitButton.disabled = true;

    request.addEventListener('loadend', ()=> {
      spinner.stop();
    });

    request.addEventListener('fail', () => submitButton.disabled = false);
    request.addEventListener('success', (event) => {
      if (event.result.reload) {
        window.location.reload();
      } else if (event.result.html) {
        document.querySelector('.quiz-timeline .quiz-timeline__number_current')
          .classList.remove('quiz-timeline__number_current');

        document.querySelectorAll('.quiz-timeline span')[event.result.questionNumber]
          .classList.add('quiz-timeline__number_current');

        form.innerHTML = event.result.html;
      } else {
        console.error("Bad response", event.result);
      }
    });


  };

}

exports.init = init;