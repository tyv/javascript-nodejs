var angular = require('angular');
var moment = require('moment');

angular.module('profile')
  .directive('dateInput', function() {
    return {
      require: 'ngModel',
      link:    function(scope, element, attrs, ngModel) {


        if (0) ngModel.$validators.date = function(modelValue, viewValue) {
          // modelValue is
          if (!viewValue) return true;

          var value = modelValue || viewValue;
          if (!value) return true;
          var split = value.split('.');
          if (split.length != 3) return false;
          var date = new Date(split[2], split[1] - 1, split[0]);

          if (split[2].length != 4) return false;

          return date.getFullYear() == split[2] && date.getMonth() == split[1] - 1 && date.getDate() == split[0];
        };

        //Set the initial value to the View and the Model
        ngModel.$formatters.unshift(function(modelValue) {
          if (!modelValue) return "";
          return moment(modelValue).format("DD.MM.YYYY");
        });

        ngModel.$parsers.unshift(function(inputValue) {
          if (!inputValue) return;
          var momentDate = moment(inputValue, "DD.MM.YYYY");

          ngModel.$setValidity('date', momentDate.isValid());

          return momentDate.toDate();
        });

      }
    };
  });

