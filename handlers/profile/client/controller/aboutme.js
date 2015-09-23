var angular = require('angular');
var profile = angular.module('profile');

var renderParagraphsAndLinks = require('renderParagraphsAndLinks');
profile.controller('ProfileAboutMeCtrl', ($scope, me) => {

  $scope.me = me;

  $scope.renderParagraphsAndLinks = require('renderParagraphsAndLinks');
});
