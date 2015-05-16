var loadSquarePhoto = require('photoCut').loadSquarePhoto;
var notification = require('client/notification');
var xhr = require('client/xhr');

module.exports = function({onSuccess, onLoadStart, onLoadEnd}) {
  loadSquarePhoto({
    minSize:   160,
    onSuccess: uploadPhoto
  });

};

function uploadPhoto(file) {

  var formData = new FormData();
  formData.append("photo", file);

  var request = xhr({
    method: 'PATCH',
    url:    '/users/me',
    body:   payload
  });

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

