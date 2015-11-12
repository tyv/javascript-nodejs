var angular = require('angular');

/**
 * WARNING: must use @ngInject (@see https://github.com/olov/ng-annotate)
 * for resolve factories, otherwise uglify will break the script!
 * will not be auto-injected
 */
angular.module('profile').config(($locationProvider, $stateProvider, $urlRouterProvider) => {
  $locationProvider.html5Mode(true);

  // For any unmatched url, redirect to /
  $urlRouterProvider.otherwise("/");

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
        quizResults: /*@ngInject*/ (QuizResults) => QuizResults.query()
      }
    },
    'root.subscriptions':  {
      url:         '/subscriptions',
      title:       'Уведомления',
      templateUrl: "/profile/templates/partials/subscriptions",
      controller:  'ProfileSubscriptionsCtrl',
      resolve:     {
        newsletters: /*@ngInject*/ (Newsletters) => Newsletters.query()
      }
    },
    'root.orders':  {
      url:         '/orders',
      title:       'Заказы',
      templateUrl: "/profile/templates/partials/orders",
      controller:  'ProfileOrdersCtrl',
      resolve:     {
        orders: /*@ngInject*/ (Orders) => Orders.query()
      }
    },
    'root.courses':  {
      url:         '/courses',
      title:       'Курсы',
      templateUrl: "/profile/templates/partials/courseGroups",
      controller:  'ProfileCourseGroupsCtrl',
      resolve:     {
        courseGroups: /*@ngInject*/ (CourseGroups) => CourseGroups.query()
      }
    }
  };

  // enable all states, but show in tabs only those which have info
  for (var key in states) {
    $stateProvider.state(key, states[key]);
  }

});
