var xhr = require('client/xhr');
var Spinner = require('client/spinner');

class FeedbackLoader {

  constructor(elem, course, filter) {

    this.elem = elem;
    this.baseUrl = `/courses/${course}/feedback?partialMode=1`;

    for (var key in filter) {
      this.baseUrl += `&${key}=${filter[key]}`;
    }


    var spinner = new Spinner();
    this.elem.innerHTML = '';
    this.elem.appendChild(spinner.elem);
    spinner.start();

    this.load({
      skip: 0
    });
  }

  load({skip}) {

    let url = `${this.baseUrl}&skip=${skip}`;

    const request = xhr({
      method: 'GET',
      url:    url
    });

    spinner.start();
    submitButton.disabled = true;

    request.addEventListener('loadend', (event) => {
      spinner.stop();
      submitButton.disabled = false;
    });

    request.addEventListener('success', (event) => {

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
