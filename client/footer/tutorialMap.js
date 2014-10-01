// TODO
var delegate = require('client/delegate');

function TutorialMap(elem) {
  this.elem = elem;


  this.delegate('[data-sitemap-show-tasks', 'change', this.onShowTasksChange);

}

TutorialMap.prototype.onShowTasksChange = function(event) {
  if (event.delegateTarget.checked) {
    this.elem.classList.add('show-tasks');
  } else {
    this.elem.classList.remove('show-tasks');
  }
};

delegate.delegateMixin(TutorialMap.prototype);
