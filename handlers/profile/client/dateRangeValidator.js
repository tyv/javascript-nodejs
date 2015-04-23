var notification = require('client/notification');
var angular = require('angular');
var moment = require('momentWithLocale');

angular.module('profile')
  .directive('dateRangeValidator', function() {
    return {
      require: 'ngModel',
      link:    function(scope, element, attrs, ngModel) {

        var range = attrs.dateRangeValidator.split('-');
        var from = range[0] ? moment(range[0], "DD.MM.YYYY").toDate() : new Date();
        var to = range[1] ? moment(range[1], "DD.MM.YYYY").toDate() : new Date();

        ngModel.$validators.dateRange = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          if (!value) return true;

          var split = value.split('.');
          if (split.length != 3) return false;
          var date = new Date(split[2], split[1]-1, split[0]);

          if (split[2].length != 4) return false;

          return date >= from && date <= to;
        };
      }
    };

  });



