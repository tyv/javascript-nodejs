import notification from 'client/notification';
import angular from 'angular';

angular.module('profile')
  .directive('profileAuthProviders', function(promiseTracker, $http, authPopup, Me) {
    return {
      templateUrl: 'templates/partials/profileAuthProviders',
      replace: true,

      link: function(scope) {

        scope.connect = function(providerName) {
          authPopup('/auth/connect/' + providerName, () => {

            scope.me = Me.get();

          }, () => {
            console.log("fail", arguments);
          });
        };
      }
    };

  }).service('authPopup', function() {

    var authPopup;

    return function(url, onSuccess, onFail) {

        if (authPopup && !authPopup.closed) {
          authPopup.close(); // close old popup if any
        }
        var width = 800, height = 600;
        var top = (window.outerHeight - height) / 2;
        var left = (window.outerWidth - width) / 2;

        window.authModal = {
          onAuthSuccess: onSuccess,
          onAuthFailure: onFail
        };

        authPopup = window.open(url, 'authModal', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
    };

  });



