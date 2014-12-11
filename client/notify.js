/**
 * For new notification types extend Notification
 */

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
    requestAnimationFrame(() => this.recalculate());
  }

  unregister(notification) {
    var idx = this.notifications.indexOf(notification);
    this.notifications.splice(idx, 1);
    this.recalculate();
  }

  recalculate() {
    var top = this.verticalSpace;
    this.notifications.forEach( notification => {
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
    var elem = this.elem = document.createElement('div');
    elem.className = 'notify notify_' + type;
    elem.innerHTML = html;

    document.body.append(elem);

    manager.register(this);
    this.setupClose();
  }

  close() {
    if (!this.elem.parentNode) return; // already closed (by user click?)
    this.elem.remove();
    manager.unregister(this);
  }

  setupClose() {
    setTimeout(() => this.close(), 2500);
  }

  get height() {
    return this.elem.offsetHeight;
  }

  set top(value) {
    this.elem.style.transform = 'translateY(' + value + 'px)';
  }

}

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


  setupClose() {
    setTimeout(() => this.close(), 5000);
  }

}

export class Test extends Notification {

  constructor(html) {
    super(html, 'error');
  }


  setupClose() {

  }

}

window.Test = Test;