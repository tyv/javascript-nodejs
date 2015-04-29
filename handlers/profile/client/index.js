var angular = require('angular');
var notification = require('client/notification');
var moment = require('momentWithLocale');
var pluralize = require('textUtil/pluralize');

var profile = angular.module('profile', [
  'ui.router', 'ngResource', 'global403Interceptor', 'ajoslin.promise-tracker', 'progress', 'focusOn', 'ngMessages'
]);

require('./directive/profileField');
require('./directive/orderParticipants');
require('./directive/orderContact');
require('./directive/profilePhoto');
require('./directive/profilePassword');
require('./directive/profileAuthProviders');
require('./directive/dateValidator');
require('./directive/dateRangeValidator');


profile.factory('Me', require('./factory/me'));

profile.factory('QuizResults', require('./factory/quizResults'));

profile.factory('Orders', require('./factory/orders'));

profile.config(require('./config'));

profile.controller('ProfileRootCtrl', require('./controller/root'));

profile.controller('ProfileOrdersCtrl', require('./controller/orders'));

profile.controller('ProfileAboutMeCtrl', require('./controller/aboutme'));

profile.controller('ProfileQuizResultsCtrl', require('./controller/quizResults'));

profile.controller('ProfileAccountCtrl', require('./controller/account'));


profile
  .filter('capitalize', () => function(str) {
    return str[0].toUpperCase() + str.slice(1);
  })
  .filter('longDate', () => function(date) {
    return moment(date).format('D MMMM YYYY в LT');
  })
  .filter('quizDuration', () => function(ms) {
    var seconds = Math.round(ms / 1000);
    return moment.duration(seconds, 'seconds').humanize();
  })
  .filter('pluralize', function() {
    return pluralize;
  })
  .filter('trust_html', function($sce){
    return function(text) {
      text = $sce.trustAsHtml(text);
      return text;
    };
  });




