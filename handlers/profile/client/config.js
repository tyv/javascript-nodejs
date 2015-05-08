var angular = require('angular');

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
    },
    'root.courseGroups':  {
      url:         '/courses',
      title:       'Курсы',
      templateUrl: "/profile/templates/partials/courseGroups",
      controller:  'ProfileCourseGroupsCtrl',
      resolve:     {
        courseGroups: (CourseGroups) => CourseGroups.query()
      }
    }
  };

  // enable all states, but show in tabs only those which have info
  for (var key in states) {
    $stateProvider.state(key, states[key]);
  }

});
