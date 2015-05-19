var notification = require('client/notification');
var angular = require('angular');
var thumb = require('client/image').thumb;
var promptSquarePhoto = require('photoCut').promptSquarePhoto;

angular.module('profile')
  .directive('profilePhoto', function(promiseTracker, $http) {
    return {
      templateUrl: '/profile/templates/partials/profilePhoto',
      scope: {
        photo: '='
      },
      replace: true,

      link: function(scope, element, attrs, noCtrl) {
        scope.loadingTracker = promiseTracker();

        scope.changePhoto = function() {

          promptSquarePhoto({
            minSize:   160,
            onSuccess: uploadPhoto
          });

        };

        function uploadPhoto(file) {

          var formData = new FormData();
          formData.append("photo", file);

          $http({
            method: 'POST',
            url: '/imgur/upload',
            headers: {'Content-Type': undefined },
            tracker: scope.loadingTracker,
            transformRequest: angular.identity,
            data: formData
          }).then(function(response) {

            return $http({
              method: 'PATCH',
              url: '/users/me',
              tracker: scope.loadingTracker,
              data: {
                photoId: response.data.imgurId
              }
            });

          }).then(function(response) {
            scope.photo = response.data.photo;
            new notification.Success("Изображение обновлено.");
          }, function(response) {
            if (response.status == 400) {
              new notification.Error("Неверный тип файла или изображение повреждено.");
            } else {
              /* global403Interceptor will show the rest */
            }
          });


        }
      }
    };

  })
  .filter('thumb', () => thumb);



