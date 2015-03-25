var notification = require('client/notification');
var angular = require('angular');


angular.module('profile')
  .directive('profileField', function(promiseTracker, $http, $timeout) {
    return {
      templateUrl: '/profile/templates/partials/profileField',
      scope:       {
        title:       '@fieldTitle',
        name:        '@fieldName',
        formatValue: '=?fieldFormatValue',
        value:       '=fieldValue'
      },
      replace:     true,
      transclude:  true,
      link:        function(scope, element, attrs, noCtrl, transclude) {

        if (!scope.formatValue) {
          scope.formatValue = function(value) {
            return value;
          };
        }


        scope.loadingTracker = promiseTracker();

        scope.edit = function() {
          if (this.editing) return;
          this.editing = true;
          this.editingValue = this.value;
        };

        scope.submit = function() {
          if (this.form.$invalid) return;

          if (this.value == this.editingValue) {
            this.editing = false;
            this.editingValue = '';
            return;
          }

          var formData = new FormData();
          formData.append(this.name, this.editingValue);

          $http({
            method:           'PATCH',
            url:              '/users/me',
            tracker:          this.loadingTracker,
            headers:          {'Content-Type': undefined},
            transformRequest: angular.identity,
            data:             formData
          }).then((response) => {

            if (this.name == 'displayName') {
              new notification.Success("Изменение имени везде произойдёт после перезагрузки страницы.", 'slow');
            } else if (this.name == 'email') {
              new notification.Warning("Требуется подтвердить смену email, проверьте почту.", 'slow');
            } else if (this.name == 'profileName') {
              new notification.Success("Ваш профиль доступен по новому адресу, страница будет перезагружена");
              setTimeout(function() {
                window.location.href = '/profile/' + this.editingValue + '/account';
              }, 2000);
            } else {
              new notification.Success("Информация обновлена.");
            }

            this.editing = false;
            this.value = this.editingValue;
            this.editingValue = '';

          }, (response) => {
            //console.log(response);
            if (response.status == 400) {

              new notification.Error(response.data.message);
            } else if (response.status == 409) {
              new notification.Error(response.data.message);
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
            this.editingValue = "";
          });
        };

        transclude(scope, function(clone, scope) {
          element[0].querySelector('[control-transclude]').append(clone[0]);
        });

      }
    };

  });



