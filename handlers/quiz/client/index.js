var Spinner = require('client/spinner');
var xhr = require('client/xhr');
var getCsrfCookie = require('client/getCsrfCookie');
var prism = require('client/prism');

function init() {
  var quizQuestionForm = document.querySelector('[data-quiz-question-form]');

  if (quizQuestionForm) {
    initQuizForm(quizQuestionForm);
  }

  var quizResultSaveForm = document.querySelector('[data-quiz-result-save-form]');

  if (quizResultSaveForm) {
    initQuizResultSaveForm(quizResultSaveForm);
  }


  prism.init();
}

function initQuizResultSaveForm(form) {
  form.onsubmit = function(e) {

    if (window.currentUser) {
      // normal submit => profile
      return;
    }

    e.preventDefault();

    authAndSubmit();
  };

  function authAndSubmit() {

    // let's authorize first
    var submitButton = form.querySelector('[type="submit"]');

    var spinner = new Spinner({
      elem:      submitButton,
      size:      'small',
      class:     'submit-button__spinner',
      elemClass: 'submit-button_progress'
    });
    spinner.start();

    require.ensure('auth/client', function() {
      spinner.stop();
      var AuthModal = require('auth/client').AuthModal;
      new AuthModal({
        callback: function() {
          var csrf = getCsrfCookie();
          form.elements._csrf.value = csrf;
          form.submit();
        }
      });
    }, 'authClient');

  }
}


function initQuizForm(form) {

  function getValue() {
    var type = form.elements.type.value;

    var answerElems = form.elements.answer;

    var value = [];

    for (var i = 0; i < answerElems.length; i++) {
      if (answerElems[i].checked) {
        value.push(+answerElems[i].value);
      }
    }

    if (type == 'single') {
      value = value[0];
    }

    return value;
  }

  form.onchange = function() {
    var value = getValue();

    switch(form.elements.type.value) {
    case 'single':
      form.querySelector('[type="submit"]').disabled = (value === undefined);
      break;
    case 'multi':
      form.querySelector('[type="submit"]').disabled = value.length ? false : true;
      break;
    default:
      throw new Error("unknown type");
    }
  };

  form.onsubmit = function(event) {
    event.preventDefault();
    var value = getValue();

    var request = xhr({
      method: 'POST',
      url:    form.action,
      body:   {
        answer: value
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
        prism.highlight(form);
      } else {
        console.error("Bad response", event.result);
      }
    });


  };

}

exports.init = init;