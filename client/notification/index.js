/**
 * For new notification types extend Notification
 */

var delegate = require('client/delegate');

/**
 * Calculates translateY positions when notifications are added/removed
 */
class NotificationManager {

  constructor(options = {}) {
    this.notifications = [];
    this.verticalSpace = options.verticalSpace || 8;
  }

  register(notification) {
    this.notifications.unshift(notification);
    setTimeout(() => this.recalculate(), 20);
  }

  unregister(notification) {
    var idx = this.notifications.indexOf(notification);
    this.notifications.splice(idx, 1);
    this.recalculate();
  }

  recalculate() {
    var top = this.verticalSpace;
    this.notifications.forEach(notification => {
      notification.top = top;
      top += notification.height + this.verticalSpace;
    });
  }

}

var manager;

export function init(options) {
  manager = new NotificationManager(options);
}


class Notification {

  constructor(html, type) {
    var elemHtml = `<div class="notification notification_popup notification_${type}">
    <div class="notification__content">${html}</div>
    <button title="Закрыть" class="notification__close"></button></div>`;

    document.body.insertAdjacentHTML("beforeEnd", elemHtml);

    this.elem = document.body.lastElementChild;

    manager.register(this);
    this.setupCloseHandler();
    this.setupCloseTimeout();
  }



  close() {
    if (!this.elem.parentNode) return; // already closed (by user click?)
    this.elem.remove();
    manager.unregister(this);
  }

  setupCloseHandler() {
    this.delegate('.notification__close', 'click', () => this.close());
  }

  setupCloseTimeout() {
    setTimeout(() => this.close(), 2500);
  }

  get height() {
    return this.elem.offsetHeight;
  }

  set top(value) {
    this.elem.style.transform = 'translateY(' + value + 'px)';
  }

}

delegate.delegateMixin(Notification.prototype);


export class Info extends Notification {

  constructor(html) {
    super(html, 'info');
  }

}
export class Warn extends Notification {

  constructor(html) {
    super(html, 'warn');
  }

}

export class Success extends Notification {

  constructor(html) {
    super(html, 'success');
  }

}

export class Error extends Notification {

  constructor(html) {
    super(html, 'error');
  }


  setupCloseTimeout() {
    setTimeout(() => this.close(), 5000);
  }

}

export class Test extends Notification {

  constructor(html) {
    super(html, 'error');
  }


  setupCloseTimeout() {

  }

}

window.Test = Success;