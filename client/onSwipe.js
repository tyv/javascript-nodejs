function onSwipe(elem, options) {

  options = options || {};

  var startX,
      startY,
      dist,
      onRight = options.onRight || function() {},
      onLeft = options.onLeft || function(){},
      tolerance = options.tolerance || 100, // maximum vertical distance
      threshold = options.threshold || 150, //required min distance traveled to be considered swipe
      allowedTime = options.allowedTime || 200, // maximum time allowed to travel that distance
      elapsedTime,
      startTime;

  elem.addEventListener('touchstart', function(e) {
    var touchobj = e.changedTouches[0];
    dist = 0;
    startX = touchobj.pageX;
    startY = touchobj.pageY;
    //console.log(startX, startY);
    startTime = Date.now(); // record time when finger first makes contact with surface
  }, false);

  elem.addEventListener('touchend', function(e) {
    var touchobj = e.changedTouches[0];
    dist = touchobj.pageX - startX; // get total dist traveled by finger while in contact with surface
    elapsedTime = Date.now() - startTime; // get time elapsed

    // too much up/down
    if (Math.abs(touchobj.pageY - startY) > tolerance) return;

    // too slow
    if (elapsedTime > allowedTime) return;

    if (dist > threshold) {
      onRight(e);
    }

    if (dist < -threshold) {
      onLeft(e);
    }
  }, false)

}

module.exports = onSwipe;
