var notification = require('client/notification');
var angular = require('angular');


angular.module('profile')
  .directive('profilePassword', function(promiseTracker, $http, $timeout) {
    return {
      templateUrl: '/profile/templates/partials/profilePassword',
      scope:       {
        hasPassword: '='
      },
      replace:     true,
      link:        function(scope, element, attrs, noCtrl, transclude) {

        scope.password = scope.passwordOld = '';

        scope.loadingTracker = promiseTracker();

        scope.edit = function() {
          if (this.editing) return;
          this.editing = true;

          $timeout(function() {
            var input = element[0].elements[scope.hasPassword ? 'passwordOld' : 'password'];
            input.focus();
          });
        };

        scope.submit = function() {
          if (this.form.$invalid) return;

          var formData = new FormData();
          formData.append("password", this.password);
          formData.append("passwordOld", this.passwordOld);

          $http({
            method:           'PATCH',
            url:              '/users/me',
            tracker:          this.loadingTracker,
            headers:          {'Content-Type': undefined},
            transformRequest: angular.identity,
            data:             formData
          }).then((response) => {
            new notification.Success("Пароль обновлён.");
            this.editing = false;
            // now have password for sure
            scope.hasPassword = true;
          }, (response) => {
            if (response.status == 400) {
              new notification.Error(response.data.message || response.data.errors.password);
            } else {
              new notification.Error("Ошибка загрузки, статус " + response.status);
            }
          });

        };


        scope.cancel = function() {
          if (!this.editing) return;
          // if we turn editing off now, then click event may bubble up, reach the form and enable editing back
          // so we wait until the event bubbles and ends, and *then* cancel
          $timeout(() => {
            this.editing = false;
          });
        };

      }
    };

  });



