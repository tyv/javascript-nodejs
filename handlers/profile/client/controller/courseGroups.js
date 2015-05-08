var angular = require('angular');
var notification = require('client/notification');
var moment = require('momentWithLocale');
var profile = angular.module('profile');

profile.controller('ProfileCourseGroupsCtrl', ($scope, $http, $window, courseGroups) => {
  $scope.courseGroups = courseGroups;
});
