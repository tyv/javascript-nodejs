var xhr = require('client/xhr');
var Spinner = require('client/spinner');
var delegate = require('client/delegate');
var notification = require('client/notification');
var clientRender = require('client/clientRender');
var commentForm = require('../../templates/feedback/comment-form.jade');

class FeedbackManager {

  constructor() {

    this.elem = document;

    this.delegate("[data-action-coursefeedback-comment-add]", "click", (event) => {
      event.preventDefault();
      this.getItem(event.target).addComment();

    });

    this.delegate("[data-action-coursefeedback-comment-edit]", "click", (event) => {
      event.preventDefault();
      this.getItem(event.target).editComment();
    });

  }

  getItem(elem) {
    elem = elem.closest('.course-feedback');
    if (!elem.feedbackItem) {
      elem.feedbackItem = new FeedbackItem(elem);
    }
    return elem.feedbackItem;
  }

}
delegate.delegateMixin(FeedbackManager.prototype);

class FeedbackItem {
  constructor(elem) {
    this.elem = elem;

    this.number = +elem.getAttribute('data-coursefeedback-number');

    var commentStore = this.elem.querySelector('[data-coursefeedback-comment-raw]');
    this.teacherCommentRaw = commentStore ? commentStore.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/ ,'&') : '';

    this.delegate(".course-feedback-comment-form", "submit", (event) => {
      event.preventDefault();
      this.onSubmitComment();
    });

    this.delegate("[data-action-comment-cancel]", "click", (event) => {
      event.preventDefault();
      this.onCancelComment();
    });
  }

  addComment() {
    this.renderCommentForm();
  }

  editComment() {
    this.renderCommentForm();
  }

  renderCommentForm() {
    var teacherCommentElem = this.elem.querySelector('.course-feedback__teacher-comment');
    if (teacherCommentElem) {
      this.teacherComment = teacherCommentElem.firstChild.innerHTML;
    } else {
      this.teacherComment = "";
      teacherCommentElem = document.createElement('div');
      teacherCommentElem.className = 'course-feedback__teacher-comment';
      this.elem.querySelector('.course-feedback__info').appendChild(teacherCommentElem);
    }

    teacherCommentElem.innerHTML = clientRender(commentForm, {
      teacherCommentRaw: this.teacherCommentRaw
    });
    teacherCommentElem.querySelector('textarea').focus();
  }

  onCancelComment() {
    this.renderComment();
  }

  onSubmitComment() {
    var form = this.elem.querySelector('form');
    var value = form.elements.teacherComment.value.trim();

    const request = xhr({
      method: 'PATCH',
      url:    '/courses/feedback/comment',
      body:   {
        number: this.number,
        teacherComment: value
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

    request.addEventListener('success', (event) => {
      spinner.stop();
      submitButton.disabled = false;

      if (request.status == 200) {
        new notification.Success("Комментарий сохранён");

        this.teacherCommentRaw = value;
        this.teacherComment = event.result.teacherComment;

        this.renderComment();
      } else {
        new notification.Error("Не получилось сохранить комментарий");
      }
    });



  }

  renderComment() {
    var teacherCommentElem = this.elem.querySelector('.course-feedback__teacher-comment');

    if (!this.teacherComment) {
      if (teacherCommentElem) teacherCommentElem.remove();
      this.elem.querySelector('[data-action-coursefeedback-comment-add]').style.display = '';
      return;
    }

    this.elem.querySelector('[data-action-coursefeedback-comment-add]').style.display = 'none';

    teacherCommentElem.innerHTML = `<div></div>
          <a class="course-feedback__edit" href='#' data-action-coursefeedback-comment-edit>редактировать</a>
          `;
    teacherCommentElem.firstChild.innerHTML = this.teacherComment;
  }

}

delegate.delegateMixin(FeedbackItem.prototype);

function init() {

  new FeedbackManager();

}


init();
