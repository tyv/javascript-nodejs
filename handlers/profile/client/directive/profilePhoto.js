var notification = require('client/notification');
var angular = require('angular');
var thumb = require('client/image').thumb;
var cutPhoto = require('photoCut').cutPhoto;

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
        var self = this;

        scope.changePhoto = function() {
          var fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = "image/*";

          fileInput.onchange = function() {
            fileInput.remove();
            var reader = new FileReader();
            var file = fileInput.files[0];

            reader.onload = function(event) {
              var image = new Image();
              image.onload = function() {

                if (image.height < 160 || image.width < 160) {
                  new notification.Error("Изображение должно иметь размер 160x160 или больше");
                } else if (image.width == image.height) {
                  uploadPhoto(file);
                } else {
                  cutPhoto(image, function(blob) {
                    // @see http://stackoverflow.com/questions/13198131/how-to-save-a-html5-canvas-as-image-on-a-server
                    // @see http://stackoverflow.com/questions/12391628/how-can-i-upload-an-embedded-image-with-javascript
                    uploadPhoto(blob);
                  });
                }
              };
              image.src = event.target.result;
            };
            reader.readAsDataURL(file);

          };

          // must be in body for IE
          fileInput.hidden = true;
          document.body.appendChild(fileInput);
          fileInput.click();

        };

        function uploadPhoto(file) {

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



