var angular = require('angular');
var profile = angular.module('profile');

profile.controller('ProfileQuizResultsCtrl', ($scope, quizResults) => {
  $scope.quizResults = quizResults;
});
