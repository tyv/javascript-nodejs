var notification = require('client/notification');
var angular = require('./angular');

angular.module("global403Interceptor", []).factory("http403Interceptor", function($q, $log) {
  return {
    response: function(response) {
      // do something on success
      return response || $q.when(response);
    },

    responseError: function(rejection) {
      $log.error(`error with status ${rejection.status}`);
      $log.error(rejection);

      // do something on error
      if (rejection.status == 401) {
        new notification.Error("Нет авторизации: вы вышли с сайта?");
      } else if (rejection.status == 500) {
        new notification.Error("Ошибка на стороне сервера. Попытайтесь позднее.");
      } else if (!rejection.status) {
        new notification.Error("Сетевая ошибка. Нет связи?");
      }
      return $q.reject(rejection);
    }
  };


}).config(($provide, $httpProvider) => $httpProvider.interceptors.push('http403Interceptor'));