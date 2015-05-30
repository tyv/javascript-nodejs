var angular = require('angular');

angular.module('profile')
  .service('authPopup', function() {

  var authPopup;

  return function(url, onSuccess, onFail) {

    if (authPopup && !authPopup.closed) {
      authPopup.close(); // close old popup if any
    }
    var width = 800, height = 600;
    var top = (window.outerHeight - height) / 2;
    var left = (window.outerWidth - width) / 2;

    window.authForm = {
      onAuthSuccess: onSuccess,
      onAuthFailure: onFail
    };

    authPopup = window.open(url, 'authForm', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
  };

});



