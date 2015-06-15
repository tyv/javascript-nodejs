var angular = require('angular');
var notification = require('client/notification');
var profile = angular.module('profile');

profile.controller('ProfileCourseGroupsCtrl', ($scope, $http, $window, courseGroups) => {
  $scope.courseGroups = courseGroups;
});
