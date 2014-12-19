import angular from 'angular';
import notification from 'client/notification';

var profile = angular.module('profile', [
  'ui.router', 'ngResource', 'global403Interceptor', 'ajoslin.promise-tracker', 'progress', 'focusOn'
]);

import './profileField';
import './profilePhoto';

profile.factory('Me', ($http) => {
  return $http.get('/users/me').then(function(res) {
    var data = res.data;
    data.created = new Date(data.created);
    return data;
  });
});


profile
  .config(($locationProvider, $stateProvider) => {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('root', {
        abstract:    true,
        resolve:     {
          me: (Me) => Me
        },
        templateUrl: "templates/partials/root",
        controller:  'ProfileRootCtrl'
      })
      .state('root.aboutme', {
        url:         "/",
        resolve:     {
          me: (Me) => Me
        },
        title:       'Профиль',
        templateUrl: "templates/partials/aboutme",
        controller:  'ProfileAboutMeCtrl'
      })
      .state('root.account', {
        url:   '/account',
        title: 'Аккаунт'
      });
  })
  .controller('ProfileRootCtrl', ($scope, $state, $timeout, $http, me, promiseTracker) => {

    window.me = me;
    $scope.me = me;


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

  });




