var angular = require('angular');
var notification = require('client/notification');
var moment = require('moment');

var profile = angular.module('profile', [
  'ui.router', 'ngResource', 'global403Interceptor', 'ajoslin.promise-tracker', 'progress', 'focusOn', 'ngMessages'
]);

require('./profileField');
require('./profilePhoto');
require('./profilePassword');
require('./profileAuthProviders');
require('./dateValidator');
require('./dateRangeValidator');


profile.factory('Me', ($resource) => {
  return $resource('/users/me', {}, {
    get: {
      method: 'GET',
      transformResponse: function(data, headers){
        data = JSON.parse(data);
        data.created = new Date(data.created);
        return data;
      }
    }
  });
});


profile
  .config(($locationProvider, $stateProvider) => {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('root', {
        abstract:    true,
        resolve:     {
          me: (Me) => Me.get()
        },
        templateUrl: "/profile/templates/partials/root",
        controller:  'ProfileRootCtrl'
      })
      .state('root.aboutme', {
        url:         "/",
        title:       'Публичный профиль',
        templateUrl: "/profile/templates/partials/aboutme",
        controller:  'ProfileAboutMeCtrl'
      })
      .state('root.account', {
        url:   '/account',
        title: 'Аккаунт',
        templateUrl: "/profile/templates/partials/account",
        controller:  'ProfileAccountCtrl'
      });
  })
  .controller('ProfileRootCtrl', ($scope, $state, $timeout, $http, me, promiseTracker) => {

    //window.me = me;
    $scope.me = me;

    $scope.loadingTracker = promiseTracker();

    $scope.states = $state.get()
      .filter((state) => {
        return !state.abstract;
      })
      .map((state) => {
        return {
          title:     state.title,
          name:      state.name,
          url:       state.url
        };
      });


  })
  .controller('ProfileAboutMeCtrl', ($scope, me) => {

    $scope.me = me;

  })
  .controller('ProfileAccountCtrl', ($scope, $http, me, Me) => {

    $scope.me = me;

    $scope.remove = function() {
      var isSure = confirm(`${me.displayName} (${me.email}) - удалить пользователя без возможности восстановления?`);

      if (!isSure) return;

      $http({
        method:           'DELETE',
        url:              '/users/me',
        tracker:          $scope.loadingTracker,
        headers:          {'Content-Type': undefined},
        transformRequest: angular.identity,
        data:             new FormData()
      }).then((response) => {

        alert('Пользователь удалён.');
        window.location.href = '/';

      }, (response) => {
        new notification.Error("Ошибка загрузки, статус " + response.status);
      });
    };

    $scope.removeProvider = function(providerName) {
      var isSure = confirm(`${providerName} - удалить привязку?`);

      if (!isSure) return;

      $http({
        method:  'POST',
        url:     '/auth/disconnect/' + providerName,
        tracker: this.loadingTracker
      }).then( (response) => {
        // refresh user
        $scope.me = Me.get();
      }, (response) => {
        new notification.Error("Ошибка загрузки, статус " + response.status);
      });

    };

  })
  .filter('capitalize', () => function(str) {
    return str[0].toUpperCase() + str.slice(1);
  });




