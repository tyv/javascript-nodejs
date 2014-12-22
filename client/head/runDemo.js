window.runDemo = function(button) {

  var demoElem;
  var parent = button;

  debugger;

  /* jshint -W084 */
  while(parent = parent.parentElement) {
    demoElem = parent.querySelector('[data-demo]');
    if (demoElem) break;
  }



  if (!demoElem) {
    alert("Ошибка, нет элемента с демо");
  } else {
    /* jshint -W061 */
    eval(demoElem.textContent);
  }

};