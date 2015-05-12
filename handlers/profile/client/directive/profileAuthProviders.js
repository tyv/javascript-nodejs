var notification = require('client/notification');
var angular = require('angular');
require('../service/authPopup');

angular.module('profile')
  .directive('profileAuthProviders', function(promiseTracker, $http, authPopup, Me) {
    return {
      templateUrl: '/profile/templates/partials/profileAuthProviders',
      replace: true,

      link: function(scope) {

        scope.connect = function(providerName) {
          authPopup('/auth/connect/' + providerName, () => {
            // refresh user
            scope.me = Me.get();

          }, () => {
            console.error("fail", arguments);
          });
        };

        scope.connected = function(providerName) {
          var connected = false;

          if (!scope.me.providers) return false;
          scope.me.providers.forEach(function(provider) {
            if (provider.name == providerName) connected = true;
          });

          return connected;
        };
      }
    };

  });
