import angular from 'angular';
import { thumb } from 'client/image';
import notification from 'client/notification';

var profileApp = angular.module('profileApp', [
  'ui.router', 'ngResource', 'global403Interceptor','ajoslin.promise-tracker', 'progress', 'focusOn'
]);

profileApp.factory('Me', ($http) => {
  return $http.get('/users/me').then(function(res) {
    var data = res.data;
    data.created = new Date(data.created);
    return data;
  });
});

profileApp.controller('ProfileAboutMeCtrl', ($scope, $state, $timeout, $http, me, promiseTracker) => {

  var meForms = {};
  for(var key in me) {
    meForms[key] = {
      value: me[key],
      loadingTracker: promiseTracker(),
      editingValue: me[key]
    };
  }

  meForms.displayName.edit = function() {
    if (this.editing) return;
    this.editing = true;
    this.editingValue = this.value;
  };

  meForms.displayName.submit = function() {

    var formData = new FormData();
    formData.append('displayName', this.editingValue);

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


  meForms.displayName.cancel = function() {
    if (!this.editing) return;
    // if we turn editing off now, then click event may bubble up, reach the form and enable editing back
    // so we wait until the event bubbles and ends, and *then* cancel
    $timeout(() => {
      this.editing = false;
      this.editingValue = "";
    });
  };

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
      tracker: $scope.meForms.photo.loadingTracker,
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
      url: '/account',
      title: 'Аккаунт'
    });
});

