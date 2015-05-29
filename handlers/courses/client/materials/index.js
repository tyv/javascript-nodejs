var xhr = require('client/xhr');
var notification = require('client/notification');

function init() {

  initShouldNotifyMaterials();

}




function initShouldNotifyMaterials() {

  var checkbox = document.querySelector('[data-should-notify-materials]');
  var form = checkbox.closest('form');

  checkbox.onchange = function() {

    var request = xhr({
      method: 'PATCH',
      url:    form.action,
      body:   {
        id: form.elements.id.value,
        shouldNotifyMaterials: form.elements.shouldNotifyMaterials.checked
      }
    });

    request.addEventListener('success', function(event) {
      new notification.Success("Настройка сохранена.");
    });
  };

}

init();
