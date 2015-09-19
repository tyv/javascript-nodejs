var xhr = require('client/xhr');

class FeedbackLoader {

  constructor({elem, filter}) {

    this.elem = elem;
    this.container = elem.querySelector('[data-feedback-container]');
    this.baseUrl = `/courses/feedback-list?`;

    this.count = 0;

    this.hasMore = true;

    for (var key in filter) {
      this.baseUrl += `&${key}=${filter[key]}`;
    }

    this.load();

    window.addEventListener('scroll', e => this.onScroll(e));
  }

  onScroll(event) {
    if (!this.hasMore) return;

    if (this.container.getBoundingClientRect().bottom <= document.documentElement.clientHeight && !this.isLoading) {
      this.load();
    }
  }

  load() {

    let url = `${this.baseUrl}&skip=${this.count}`;

    const request = xhr({
      method: 'GET',
      json:   true,
      url:    url
    });

    this.elem.classList.add('profile__feedbacks_loading');

    this.isLoading = true;

    request.addEventListener('loadend', () => {
      this.isLoading = false;
      this.elem.classList.remove('profile__feedbacks_loading');
    });

    request.addEventListener('success', (event) => {
      if (event.result.count) {
        this.container.insertAdjacentHTML("beforeEnd", event.result.html);
        this.count += event.result.count;
      } else if (!this.count) {
        // if multiple load calls hit it => no multi-append
        this.container.innerHTML = `<p style="text-align:center">Отзывов пока нет.</p>`;
      }

      if (event.result.hasMore === false) {
        this.hasMore = false;
      }
    });

  }

}

function init() {

  new FeedbackLoader(window.FEEDBACK_LIST_INIT);

}


init();
