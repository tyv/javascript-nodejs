var angular = require('angular');
var notification = require('client/notification');
var moment = require('momentWithLocale');
var profile = angular.module('profile');

profile.controller('ProfileOrdersCtrl', ($scope, $http, $window, orders) => {
  $scope.orders = orders;

  $scope.changePayment = function(order) {
    $window.location.href = `/courses/orders/${order.number}?changePayment=1`;
  };

  $scope.cancelOrder = function(order) {

    var isOk = confirm("Заказ будет отменён, без возможности восстановления. Продолжать?");

    if (!isOk) return;

    var formData = new FormData();
    formData.append("orderNumber", order.number);

    $http({
      method:           'DELETE',
      url:              '/payments/common/order',
      headers:          {'Content-Type': undefined},
      transformRequest: angular.identity,
      data:             formData
    }).then((response) => {

      orders.splice(orders.indexOf(order), 1);
      new notification.Success("Заказ удалён.");

    }, (response) => {
      if (response.status == 400) {
        new notification.Error(response.data.message);
      } else {
        new notification.Error("Ошибка загрузки, статус " + response.status);
      }
    });

  };
});
