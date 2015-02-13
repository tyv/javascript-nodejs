/**
 * Usage:
var handler = hoverIntent(function() {
  console.log("in", this);
}, function() {
  console.log("out", this);
});

 $('.codebox').addEventListener('mouseover', handler);
 $('.codebox').addEventListener('mouseout', handler);

 TODO: refactor me.

 * @param handlerIn
 * @param handlerOut
 * @returns {Function}
 */


function hoverIntent(handlerIn, handlerOut) {

  // default configuration values
  var cfg = {
    interval:    100,
    sensitivity: 6,
    timeout:     0,
    over:        handlerIn,
    out:         handlerOut
  };

  // instantiate variables
  // cX, cY = current X and Y position of mouse, updated by mousemove event
  // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
  var cX, cY, pX, pY;

  // A private function for getting mouse position
  function track(event) {
    cX = event.pageX;
    cY = event.pageY;
  }

  // A private function for comparing current and previous mouse position
  function compare(event, elem) {
    elem.hoverIntentTimer = clearTimeout(elem.hoverIntentTimer);
    // compare mouse positions to see if they've crossed the threshold
    if (Math.sqrt((pX - cX) * (pX - cX) + (pY - cY) * (pY - cY)) < cfg.sensitivity) {
      elem.removeEventListener("mousemove", track);
      // set hoverIntent state to true (so mouseOut can be called)
      elem.hoverIntentState = true;
      cfg.over.call(elem, event);
      return;
    }

    // set previous coordinates for next time
    pX = cX;
    pY = cY;
    // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
    elem.hoverIntentTimer = setTimeout(function() {
      compare(event, elem);
    }, cfg.interval);
  }


  // A private function for handling mouse 'hovering'
  return function(event) {

    // cancel hoverIntent timer if it exists
    if (this.hoverIntentTimer) {
      clearTimeout(this.hoverIntentTimer);
      delete this.hoverIntentTimer;
    }

    // if e.type === "mouseenter"
    if (event.type === "mouseover") {
      // set "previous" X and Y position based on initial entry point
      pX = event.pageX;
      pY = event.pageY;
      this.addEventListener('mousemove', track);

      // start polling interval (self-calling timeout) to compare mouse coordinates over time
      if (!this.hoverIntentState) {
        this.hoverIntentTimer = setTimeout(function() {
          compare(event, this);
        }.bind(this), cfg.interval);
      }

      // else e.type == "mouseleave"
    } else {
      // unbind expensive mousemove event
      this.removeEventListener('mousemove', track);
      // if hoverIntent state is true, then call the mouseOut function after the specified delay
      if (this.hoverIntentState) {
        this.hoverIntentTimer = setTimeout(function() {
          this.hoverIntentState = false;
          cfg.out.call(this, event);
        }.bind(this), cfg.timeout);
      }
    }
  };

}

module.exports = (document.ontouchstart === undefined) ? hoverIntent : function() { return function() {}; };
