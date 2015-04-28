var notification = require('client/notification');
var angular = require('angular');

angular.module('profile')
  .directive('orderContact', function(promiseTracker, $http, $timeout) {
    return {
      templateUrl: '/profile/templates/partials/orderContact',
      scope:       {
        order:       '='
      },
      replace:     true,
      link:        function(scope, element, attrs, noCtrl, transclude) {

        scope.contactName = scope.order.contactName;
        scope.contactPhone = scope.order.contactPhone;

        scope.loadingTracker = promiseTracker();

        scope.submit = function() {
          if (this.contactForm.$invalid) return;

          var formData = new FormData();

          formData.append("orderNumber", scope.order.number);
          formData.append("contactName", scope.contactName);
          formData.append("contactPhone", scope.contactPhone);

          $http({
            method:           'PATCH',
            url:              '/courses/order',
            tracker:          this.loadingTracker,
            headers:          {'Content-Type': undefined},
            transformRequest: angular.identity,
            data:             formData
          }).then((response) => {

            new notification.Success("Информация обновлена.");
            scope.order.contactName = scope.contactName;
            scope.order.contactPhone = scope.contactPhone;

          }, (response) => {
            if (response.status == 400) {
              new notification.Error(response.data.message);
            } else {
              new notification.Error("Ошибка загрузки, статус " + response.status);
            }
          });

        };



      }
    };

  });



