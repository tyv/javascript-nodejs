var angular = require('angular');
var profile = angular.module('profile');

profile.controller('ProfileAboutMeCtrl', ($scope, me) => {

  $scope.me = me;

});
