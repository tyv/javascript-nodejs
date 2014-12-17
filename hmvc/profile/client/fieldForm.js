import notification from 'client/notification';
import angular from 'angular';


angular.module('fieldForm', [])
  .directive('fieldForm', function(promiseTracker, $http, $timeout) {
    return {
      templateUrl: 'templates/partials/fieldForm',
      scope: {
        title: '@',
        name: '@',
        value: '='
      },
      replace: true,
      link: function(scope, element, attrs) {
        scope.loadingTracker = promiseTracker();

        scope.edit = function() {
          if (this.editing) return;
          this.editing = true;
          this.editingValue = this.value;
        };

        scope.submit = function() {
          if (this.form.$invalid) return;

          var formData = new FormData();
          formData.append(this.name, this.editingValue);

          $http({
            method: 'PATCH',
            url: '/users/me',
            tracker: this.loadingTracker,
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity,
            data: formData
          }).then((response) => {
            this.value = this.editingValue;
            this.editing = false;
            this.editingValue = '';
            new notification.Success("Информация обновлена.");
          }, (response) => {
            new notification.Error("Ошибка загрузки, статус " + response.status);
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



      }
    };

  });



