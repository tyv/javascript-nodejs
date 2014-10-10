require=
// modules are defined as an array
// [ module function, map of requireuires ]
//
// map of requireuires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the requireuire for previous bundles

(function outer (modules, cache, entry) {
    // Save the require from previous bundle to this closure if any
    var previousRequire = typeof require == "function" && require;

    function newRequire(name, jumped){
        if(!cache[name]) {
            if(!modules[name]) {
                // if we cannot find the the module within our internal map or
                // cache jump to the current global require ie. the last bundle
                // that was added to the page.
                var currentRequire = typeof require == "function" && require;
                if (!jumped && currentRequire) return currentRequire(name, true);

                // If there are other bundles on this page the require from the
                // previous one is saved to 'previousRequire'. Repeat this as
                // many times as there are bundles until the module is found or
                // we exhaust the require chain.
                if (previousRequire) return previousRequire(name, true);
                var err = new Error('Cannot find module \'' + name + '\'');
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            var m = cache[name] = {exports:{}};
            modules[name][0].call(m.exports, function(x){
                var id = modules[name][1][x];
                return newRequire(id ? id : x);
            },m,m.exports,outer,modules,cache,entry);
        }
        return cache[name].exports;
    }
    for(var i=0;i<entry.length;i++) newRequire(entry[i]);

    // Override the current require with this new one
    return newRequire;
})
({"/js/javascript-nodejs/node_modules/client/dom/findClosest.js":[function(require,module,exports){
// find the nearest ancestor matching selector
module.exports = function(elem, selector) {

  while (elem) {
    if (elem.matches(selector)) {
      return elem;
    } else {
      elem = elem.parentElement;
    }
  }
  return null;

};

},{}],"/js/javascript-nodejs/node_modules/client/footer/showLinkType.js":[function(require,module,exports){
var findClosest = require('client/dom/findClosest');

module.exports = function() {

  var tooltipSpan = null;
  var shiftX = 8;
  var shiftY = 10;

  function updatePosition(event) {
    var left = event.clientX + shiftX;
    if (left + tooltipSpan.offsetWidth > document.documentElement.clientWidth) { // if beyond the right document border
      // mirror to the left
      left = Math.max(0, event.clientX - shiftX - tooltipSpan.offsetWidth);
    }
    tooltipSpan.style.left = left + 'px';

    var top = event.clientY + shiftY;
    if (top + tooltipSpan.offsetHeight > document.documentElement.clientHeight) {
      top = Math.max(0, event.clientY - shiftY - tooltipSpan.offsetHeight);
    }

    tooltipSpan.style.top = top + 'px';
  }

  // we show tooltip element for any link hover, but few of them actually get styled
  document.addEventListener('mouseover', function(event) {
    var link = findClosest(event.target, 'a');

    if (!link) return;

    tooltipSpan = document.createElement('span');
    tooltipSpan.className = 'link__type';

    if (link.getAttribute('data-tooltip')) {
      tooltipSpan.setAttribute('data-tooltip', link.getAttribute('data-tooltip'));
    } else {
      tooltipSpan.setAttribute('data-url', link.getAttribute('href'));
    }

    document.body.appendChild(tooltipSpan);
    updatePosition(event);

    document.addEventListener('mousemove', updatePosition);
  });

  document.addEventListener('mouseout', function() {
    if (!tooltipSpan) return;

    document.removeEventListener('mousemove', updatePosition);
    tooltipSpan.remove();
    tooltipSpan = null;
  });
};

},{"client/dom/findClosest":"/js/javascript-nodejs/node_modules/client/dom/findClosest.js"}],"client/footer":[function(require,module,exports){
//require('./preventDocumentScroll');
var showLinkType = require('./showLinkType');

exports.init = function() {
  showLinkType();
};


},{"./showLinkType":"/js/javascript-nodejs/node_modules/client/footer/showLinkType.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9qcy9qYXZhc2NyaXB0LW5vZGVqcy9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpZW50L2RvbS9maW5kQ2xvc2VzdC5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvZm9vdGVyL3Nob3dMaW5rVHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9jbGllbnQvZm9vdGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBtb2R1bGVzIGFyZSBkZWZpbmVkIGFzIGFuIGFycmF5XG4vLyBbIG1vZHVsZSBmdW5jdGlvbiwgbWFwIG9mIHJlcXVpcmV1aXJlcyBdXG4vL1xuLy8gbWFwIG9mIHJlcXVpcmV1aXJlcyBpcyBzaG9ydCByZXF1aXJlIG5hbWUgLT4gbnVtZXJpYyByZXF1aXJlXG4vL1xuLy8gYW55dGhpbmcgZGVmaW5lZCBpbiBhIHByZXZpb3VzIGJ1bmRsZSBpcyBhY2Nlc3NlZCB2aWEgdGhlXG4vLyBvcmlnIG1ldGhvZCB3aGljaCBpcyB0aGUgcmVxdWlyZXVpcmUgZm9yIHByZXZpb3VzIGJ1bmRsZXNcblxuKGZ1bmN0aW9uIG91dGVyIChtb2R1bGVzLCBjYWNoZSwgZW50cnkpIHtcbiAgICAvLyBTYXZlIHRoZSByZXF1aXJlIGZyb20gcHJldmlvdXMgYnVuZGxlIHRvIHRoaXMgY2xvc3VyZSBpZiBhbnlcbiAgICB2YXIgcHJldmlvdXNSZXF1aXJlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7XG5cbiAgICBmdW5jdGlvbiBuZXdSZXF1aXJlKG5hbWUsIGp1bXBlZCl7XG4gICAgICAgIGlmKCFjYWNoZVtuYW1lXSkge1xuICAgICAgICAgICAgaWYoIW1vZHVsZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBjYW5ub3QgZmluZCB0aGUgdGhlIG1vZHVsZSB3aXRoaW4gb3VyIGludGVybmFsIG1hcCBvclxuICAgICAgICAgICAgICAgIC8vIGNhY2hlIGp1bXAgdG8gdGhlIGN1cnJlbnQgZ2xvYmFsIHJlcXVpcmUgaWUuIHRoZSBsYXN0IGJ1bmRsZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2FzIGFkZGVkIHRvIHRoZSBwYWdlLlxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UmVxdWlyZSA9IHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO1xuICAgICAgICAgICAgICAgIGlmICghanVtcGVkICYmIGN1cnJlbnRSZXF1aXJlKSByZXR1cm4gY3VycmVudFJlcXVpcmUobmFtZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgb3RoZXIgYnVuZGxlcyBvbiB0aGlzIHBhZ2UgdGhlIHJlcXVpcmUgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBwcmV2aW91cyBvbmUgaXMgc2F2ZWQgdG8gJ3ByZXZpb3VzUmVxdWlyZScuIFJlcGVhdCB0aGlzIGFzXG4gICAgICAgICAgICAgICAgLy8gbWFueSB0aW1lcyBhcyB0aGVyZSBhcmUgYnVuZGxlcyB1bnRpbCB0aGUgbW9kdWxlIGlzIGZvdW5kIG9yXG4gICAgICAgICAgICAgICAgLy8gd2UgZXhoYXVzdCB0aGUgcmVxdWlyZSBjaGFpbi5cbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNSZXF1aXJlKSByZXR1cm4gcHJldmlvdXNSZXF1aXJlKG5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIG1vZHVsZSBcXCcnICsgbmFtZSArICdcXCcnKTtcbiAgICAgICAgICAgICAgICBlcnIuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbSA9IGNhY2hlW25hbWVdID0ge2V4cG9ydHM6e319O1xuICAgICAgICAgICAgbW9kdWxlc1tuYW1lXVswXS5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24oeCl7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gbW9kdWxlc1tuYW1lXVsxXVt4XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3UmVxdWlyZShpZCA/IGlkIDogeCk7XG4gICAgICAgICAgICB9LG0sbS5leHBvcnRzLG91dGVyLG1vZHVsZXMsY2FjaGUsZW50cnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIH1cbiAgICBmb3IodmFyIGk9MDtpPGVudHJ5Lmxlbmd0aDtpKyspIG5ld1JlcXVpcmUoZW50cnlbaV0pO1xuXG4gICAgLy8gT3ZlcnJpZGUgdGhlIGN1cnJlbnQgcmVxdWlyZSB3aXRoIHRoaXMgbmV3IG9uZVxuICAgIHJldHVybiBuZXdSZXF1aXJlO1xufSlcbiIsIi8vIGZpbmQgdGhlIG5lYXJlc3QgYW5jZXN0b3IgbWF0Y2hpbmcgc2VsZWN0b3Jcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWxlbSwgc2VsZWN0b3IpIHtcblxuICB3aGlsZSAoZWxlbSkge1xuICAgIGlmIChlbGVtLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbSA9IGVsZW0ucGFyZW50RWxlbWVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG5cbn07XG4iLCJ2YXIgZmluZENsb3Nlc3QgPSByZXF1aXJlKCdjbGllbnQvZG9tL2ZpbmRDbG9zZXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHRvb2x0aXBTcGFuID0gbnVsbDtcbiAgdmFyIHNoaWZ0WCA9IDg7XG4gIHZhciBzaGlmdFkgPSAxMDtcblxuICBmdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCkge1xuICAgIHZhciBsZWZ0ID0gZXZlbnQuY2xpZW50WCArIHNoaWZ0WDtcbiAgICBpZiAobGVmdCArIHRvb2x0aXBTcGFuLm9mZnNldFdpZHRoID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSB7IC8vIGlmIGJleW9uZCB0aGUgcmlnaHQgZG9jdW1lbnQgYm9yZGVyXG4gICAgICAvLyBtaXJyb3IgdG8gdGhlIGxlZnRcbiAgICAgIGxlZnQgPSBNYXRoLm1heCgwLCBldmVudC5jbGllbnRYIC0gc2hpZnRYIC0gdG9vbHRpcFNwYW4ub2Zmc2V0V2lkdGgpO1xuICAgIH1cbiAgICB0b29sdGlwU3Bhbi5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cbiAgICB2YXIgdG9wID0gZXZlbnQuY2xpZW50WSArIHNoaWZ0WTtcbiAgICBpZiAodG9wICsgdG9vbHRpcFNwYW4ub2Zmc2V0SGVpZ2h0ID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkge1xuICAgICAgdG9wID0gTWF0aC5tYXgoMCwgZXZlbnQuY2xpZW50WSAtIHNoaWZ0WSAtIHRvb2x0aXBTcGFuLm9mZnNldEhlaWdodCk7XG4gICAgfVxuXG4gICAgdG9vbHRpcFNwYW4uc3R5bGUudG9wID0gdG9wICsgJ3B4JztcbiAgfVxuXG4gIC8vIHdlIHNob3cgdG9vbHRpcCBlbGVtZW50IGZvciBhbnkgbGluayBob3ZlciwgYnV0IGZldyBvZiB0aGVtIGFjdHVhbGx5IGdldCBzdHlsZWRcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgbGluayA9IGZpbmRDbG9zZXN0KGV2ZW50LnRhcmdldCwgJ2EnKTtcblxuICAgIGlmICghbGluaykgcmV0dXJuO1xuXG4gICAgdG9vbHRpcFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdG9vbHRpcFNwYW4uY2xhc3NOYW1lID0gJ2xpbmtfX3R5cGUnO1xuXG4gICAgaWYgKGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLXRvb2x0aXAnKSkge1xuICAgICAgdG9vbHRpcFNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLXRvb2x0aXAnLCBsaW5rLmdldEF0dHJpYnV0ZSgnZGF0YS10b29sdGlwJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b29sdGlwU3Bhbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJywgbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b29sdGlwU3Bhbik7XG4gICAgdXBkYXRlUG9zaXRpb24oZXZlbnQpO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdXBkYXRlUG9zaXRpb24pO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uKCkge1xuICAgIGlmICghdG9vbHRpcFNwYW4pIHJldHVybjtcblxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHVwZGF0ZVBvc2l0aW9uKTtcbiAgICB0b29sdGlwU3Bhbi5yZW1vdmUoKTtcbiAgICB0b29sdGlwU3BhbiA9IG51bGw7XG4gIH0pO1xufTtcbiIsIi8vcmVxdWlyZSgnLi9wcmV2ZW50RG9jdW1lbnRTY3JvbGwnKTtcbnZhciBzaG93TGlua1R5cGUgPSByZXF1aXJlKCcuL3Nob3dMaW5rVHlwZScpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgc2hvd0xpbmtUeXBlKCk7XG59O1xuXG4iXX0=
