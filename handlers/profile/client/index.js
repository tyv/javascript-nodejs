var angular = require('angular');
var notification = require('client/notification');
var moment = require('momentWithLocale');
var pluralize = require('textUtil/pluralize');

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
      method:            'GET',
      transformResponse: function(data, headers) {
        data = JSON.parse(data);
        data.created = new Date(data.created);
        return data;
      }
    }
  });
});

profile.factory('QuizResults', ($resource) => {
  return $resource('/quiz/results/user/' + window.currentUser.id, {}, {
    query: {
      method:            'GET',
      isArray:           true,
      transformResponse: function(data, headers) {

        data = JSON.parse(data);
        data.forEach(function(result) {
          result.created = new Date(result.created);
        });
        return data;
      }
    }
  });
});


profile.factory('Orders', ($resource) => {
  return $resource('/payments/common/orders/user/' + window.currentUser.id, {}, {
    query: {
      method:            'GET',
      isArray:           true,
      transformResponse: function(data, headers) {
        data = JSON.parse(data);
        data.forEach(function(order) {
          order.created = new Date(order.created);

          order.countDetails = {
            free:     order.participants.length - order.count,
            busy:     order.participants.length,
            accepted: order.participants.filter(function(participant) {
              return participant.accepted;
            }).length
          };
        });

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
      });

    var states = {
      'root.aboutme': {
        url:         "/",
        title:       'Публичный профиль',
        templateUrl: "/profile/templates/partials/aboutme",
        controller:  'ProfileAboutMeCtrl'
      },
      'root.account': {
        url:         '/account',
        title:       'Аккаунт',
        templateUrl: "/profile/templates/partials/account",
        controller:  'ProfileAccountCtrl'
      },
      'root.quiz':    {
        url:         '/quiz',
        title:       'Тесты',
        templateUrl: "/profile/templates/partials/quiz",
        controller:  'ProfileQuizResultsCtrl',
        resolve:     {
          quizResults: (QuizResults) => QuizResults.query()
        }
      },
      'root.orders':  {
        url:         '/orders',
        title:       'Заказы',
        templateUrl: "/profile/templates/partials/orders",
        controller:  'ProfileOrdersCtrl',
        resolve:     {
          orders: (Orders) => Orders.query()
        }
      }
    };

    // enabled states depend on user, are set to global variable in index.jade
    for (var key in states) {
      if (~window.profileStatesEnabled.indexOf(key)) {
        $stateProvider.state(key, states[key]);
      }
    }


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
          title: state.title,
          name:  state.name,
          url:   state.url
        };
      });


  })
  .controller('ProfileOrdersCtrl', ($scope, orders) => {
    $scope.orders = orders;
  })
  .controller('ProfileAboutMeCtrl', ($scope, me) => {

    $scope.me = me;

  })
  .controller('ProfileQuizResultsCtrl', ($scope, quizResults) => {
    $scope.quizResults = quizResults;
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

  })
  .filter('capitalize', () => function(str) {
    return str[0].toUpperCase() + str.slice(1);
  })
  .filter('longDate', () => function(date) {
    return moment(date).format('D MMMM YYYY в LT');
  })
  .filter('quizDuration', () => function(seconds) {
    return moment.duration(seconds, 'seconds').humanize();
  })
  .filter('pluralize', function() {
    return pluralize;
  })
  .filter('trust_html', function($sce){
    return function(text) {
      console.log(text);
      text = $sce.trustAsHtml(text);
      console.log(text);
      return text;
    };
  });




