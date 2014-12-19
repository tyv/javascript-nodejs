import notification from 'client/notification';
import angular from 'angular';
import { thumb } from 'client/image';


angular.module('profile')
  .directive('profilePhoto', function(promiseTracker, $http, $timeout) {
    return {
      templateUrl: 'templates/partials/profilePhoto',
      scope: {
        photo: '='
      },
      replace: true,

      link: function(scope, element, attrs, noCtrl) {
        scope.loadingTracker = promiseTracker();

        scope.changePhoto = function() {
          var fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = "image/*";

          fileInput.onchange = () => uploadPhoto(fileInput.files[0]);
          fileInput.click();
        };


        function uploadPhoto(file) {
          // todo progress indication
          var formData = new FormData();
          formData.append("photo", file);

          $http({
            method: 'PATCH',
            url: '/users/me',
            headers: {'Content-Type': undefined },
            tracker: scope.loadingTracker,
            transformRequest: angular.identity,
            data: formData
          }).then(function(response) {
            scope.photo = response.data.photo;
            new notification.Success("Изображение обновлено.");
          }, function(response) {
            if (response.status == 400) {
              new notification.Error("Неверный тип файла или изображение повреждено.");
            } else {
              new notification.Error("Ошибка загрузки, статус " + response.status);
            }
          });


        }
      }
    };

  })
  .filter('thumb', () => thumb);



