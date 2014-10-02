var throttle = require('lib/throttle');

function TutorialMap(elem) {
  this.elem = elem;

  this.showTasksCheckbox = elem.querySelector('[data-tutorial-map-show-tasks]');
  this.showTasksCheckbox.checked = +localStorage.showTasksCheckbox;
  this.updateShowTasks();

  this.showTasksCheckbox.onchange = this.updateShowTasks.bind(this);


  this.elem.querySelector('[data-tutorial-map-filter]').oninput = this.onFilterInput.bind(this);
}

TutorialMap.prototype.updateShowTasks = function() {
  if (this.showTasksCheckbox.checked) {
    this.elem.classList.add('tutorial-map_show-tasks');
  } else {
    this.elem.classList.remove('tutorial-map_show-tasks');
  }

  localStorage.showTasksCheckbox = this.showTasksCheckbox.checked ? "1" : "0";
};

TutorialMap.prototype.onFilterInput = function(event) {
  this.throttleFilter(event.target.value);
};

TutorialMap.prototype.filter = function(value) {
  value = value.toLowerCase();
  var showingTasks = this.showTasksCheckbox.checked;

  var links = this.elem.querySelectorAll('.tutorial-map-link');

  var topItems = this.elem.querySelectorAll('.tutorial-map__item');

  function checkLiMatch(li) {
    return li.querySelector('a').innerHTML.toLowerCase().indexOf(value) != -1;
  }

  for (var i = 0; i < topItems.length; i++) {
    var li = topItems[i];
    var subItems = li.querySelectorAll('.tutorial-map__sub-item');
    var childMatch = Array.prototype.reduce.call(subItems, function(prevValue, subItem) {

      var childMatch = false;

      if (showingTasks) {
        var subItems = subItem.querySelectorAll('.tutorial-map__sub-sub-item');
        childMatch = Array.prototype.reduce.call(subItems, function(prevValue, subItem) {
          var match = checkLiMatch(subItem);
          subItem.hidden = !match;
          return prevValue || match;
        }, false);
      }

      var match = childMatch || checkLiMatch(subItem);
      //console.log(subItem, match);
      subItem.hidden = !match;

      return prevValue || match;
    }, false);

    li.hidden = !(childMatch || checkLiMatch(li));

  }

  /*
   for(var i = links.length - 1; i >= 0; i--) {
   // go from tail to head, so that we meet children before parents
   // a parent is shown IF it matches the filter or IF it has the children that match
   var link = links[i];
   var li = links[i].parentNode;
   }*/

};

TutorialMap.prototype.throttleFilter = throttle(TutorialMap.prototype.filter, 200);

module.exports = TutorialMap;
