var xhr = require('client/xhr');

class FeedbackLoader {

  constructor({elem, filter}) {

    this.elem = elem;
    this.container = elem.querySelector('[data-feedback-container]');
    this.baseUrl = `/courses/feedback-fetch`;

    this.reset(filter);

    window.addEventListener('scroll', e => this.onScroll(e));
  }

  reset(filter) {
    this.filter = filter;

    this.count = 0;

    this.total = null;

    this.hasMore = true;

    this.container.innerHTML = '';
    this.load();
  }

  onScroll() {
    if (!this.hasMore) return;

    if (this.container.getBoundingClientRect().bottom <= document.documentElement.clientHeight && !this.isLoading) {
      this.load();
    }
  }

  load() {

    let url = `${this.baseUrl}?skip=${this.count}&needTotal=${this.total === null ? 1 : 0}`;

    for (var key in this.filter) {
      url += `&${key}=${this.filter[key]}`;
    }

    const request = xhr({
      method: 'GET',
      json:   true,
      url:    url
    });

    this.elem.classList.add('course-feedbacks_loading');

    this.isLoading = true;

    request.addEventListener('loadend', () => {
      this.isLoading = false;
      this.elem.classList.remove('course-feedbacks_loading');
    });

    request.addEventListener('success', (event) => {
      if (event.result.total !== undefined) {
        this.total = event.result.total;
      }

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

      this.elem.dispatchEvent(new CustomEvent('feedbackChange', {
        bubbles: true,
        detail: {
          loader: this
        }
      }));

    });

  }

}

module.exports = FeedbackLoader;
