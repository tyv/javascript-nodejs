import angular from 'angular';
import { thumb } from 'client/image';
import notification from 'client/notification';

var profileApp = angular.module('profileApp', ['ui.router', 'ngResource', 'global403Interceptor']);

profileApp.factory('Me', ($http) => {
  return $http.get('/users/me').then(function(res) {
    var data = res.data;
    data.created = new Date(data.created);
    return data;
  });
});

profileApp.controller('ProfileAboutMeCtrl', ($scope, $state, $http, me) => {

  var meForms = {};
  for(var key in me) {
    meForms[key] = { value: me[key], loading: false, editingValue: me[key] };
  }

  $scope.meForms = meForms;

  $scope.states = $state.get()
    .filter( (state) => { return !state.abstract; } )
    .map( (state) => { return {
      title: state.title,
      name: state.name,
      url: state.url,
      isCurrent: state == $state.current
    }; } );


  $scope.changePhoto = function() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    //fileInput.accept = "image/*";

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
      transformRequest: angular.identity,
      data: formData
    }).then(function(response) {
      $scope.meForms.photo.value = response.data.photo;
      new notification.Success("Изображение обновлено.");
    }, function(response) {
      if (response.status == 400) {
        new notification.Error("Неверный тип файла или изображение повреждено.");
      } else {
        new notification.Error("Ошибка загрузки, статус " + response.status);
      }
    });
    /*

    var formData = new FormData();

    formData.append("photo", file);

    var request = xhr({
      method: 'PATCH',
      url: '/users/me',
      json: true,
      body: formData
    });

    // 400 when corrupt or invalid file
    request.successStatuses = [200, 400];

    var self = this;
    request.addEventListener('success', function(e) {
      if (this.status == 400) {
        new notification.Error("Неверный тип файла или изображение повреждено.");
        return;
      }

      self.updateUserPhoto(e.result.photo);
    });*/

  }

});




profileApp.filter('thumb', () => thumb);

profileApp.config(($locationProvider, $stateProvider) => {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('aboutme', {
      url: "/",
      resolve: {
        me: (Me) => Me
      },
      title: 'Профиль',
      templateUrl: "templates/partials/aboutme",
      controller: 'ProfileAboutMeCtrl'
    })
    .state('account', {
      url: 'account',
      title: 'Аккаунт'
    });
});

