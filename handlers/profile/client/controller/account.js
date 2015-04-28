var angular = require('angular');
var notification = require('client/notification');
var moment = require('momentWithLocale');

module.exports = ($scope, $http, me, Me) => {

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

      new notification.Success('Пользователь удалён.');
      setTimeout(function() {
        window.location.href = '/';
      }, 1500);

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
    }).then((response) => {
      // refresh user
      $scope.me = Me.get();
    }, (response) => {
      new notification.Error("Ошибка загрузки, статус " + response.status);
    });

  };

};
