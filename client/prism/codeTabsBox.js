var delegate = require('client/delegate');

function CodeTabsBox(elem) {

  this.elem = elem;
  this.translateX = 0;

  this.switchesElem = elem.querySelector('[data-code-tabs-switches]');
  this.switchesElemItems = this.switchesElem.firstElementChild;
  this.arrowLeft = elem.querySelector('[data-code-tabs-left]');
  this.arrowRight = elem.querySelector('[data-code-tabs-right]');


  this.arrowLeft.onclick = function(e) {
    e.preventDefault();

    this.translateX = Math.max(0, this.translateX - this.switchesElem.offsetWidth);
    this.renderTranslate();
  }.bind(this);


  this.arrowRight.onclick = function(e) {
    e.preventDefault();

    this.translateX = Math.min(this.translateX +this.switchesElem.offsetWidth, this.switchesElemItems.offsetWidth - this.switchesElem.offsetWidth);
    this.renderTranslate();
  }.bind(this);

  this.delegate('.code-tabs__switch', 'click', function(e) {
    e.preventDefault();

    var siblings = e.delegateTarget.parentNode.children;
    var tabs = elem.querySelector('[data-code-tabs-content-inner]').children;

    for(var i=0; i<siblings.length; i++) {
      var switchElem = siblings[i];
      var tabElem = tabs[i];
      if (switchElem == e.delegateTarget) {
        tabElem.classList.add('code-tabs__section_current');
        switchElem.classList.add('code-tabs__switch_current');
      } else {
        tabElem.classList.remove('code-tabs__section_current');
        switchElem.classList.remove('code-tabs__switch_current');
      }
    }

  });

}

CodeTabsBox.prototype.renderTranslate = function() {
  console.log(this.translateX);
  this.switchesElemItems.style.transform = 'translateX(-' + this.translateX + 'px)';
  if (this.translateX === 0) {
    this.arrowLeft.setAttribute('disabled', '');
  } else {
    this.arrowLeft.removeAttribute('disabled');
  }

  if (this.translateX === this.switchesElemItems.offsetWidth - this.switchesElem.offsetWidth) {
    this.arrowRight.setAttribute('disabled', '');
  } else {
    this.arrowRight.removeAttribute('disabled');
  }

};


delegate.delegateMixin(CodeTabsBox.prototype);


module.exports = CodeTabsBox;
