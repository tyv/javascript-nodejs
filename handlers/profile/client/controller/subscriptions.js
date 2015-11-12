var angular = require('angular');
var notification = require('client/notification');

//var newsletter = require('newsletter/client');

var profile = angular.module('profile');

profile.controller('ProfileSubscriptionsCtrl', ($scope, $http, me, newsletters) => {

  $scope.newsletters = newsletters;

  $scope.submit = function() {
    var body = {
      email: me.email,
      slug: newsletters.filter(nl => nl.subscribed).map(nl => nl.slug),
      replace: true
    };

    $http({
      method:           'POST',
      url:              '/newsletter/subscribe',
      tracker:          $scope.loadingTracker,
      headers:          {'Content-Type': 'application/json'},
      transformRequest: angular.identity,
      data:             JSON.stringify(body)
    }).then((response) => {

      new notification.Success('Настройки обновлены.');

    }, (response) => {
      new notification.Error("Ошибка загрузки, статус " + response.status);
    });
  };

});
