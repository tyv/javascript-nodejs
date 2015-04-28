var angular = require('angular');
var notification = require('client/notification');
var moment = require('momentWithLocale');

module.exports = ($scope, $http, $window, orders) => {
  $scope.orders = orders;

  $scope.changePayment = function(order) {
    $window.location.href = `/courses/orders/${order.number}?changePayment=1`;
  };

};
