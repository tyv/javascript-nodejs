import angular from 'angular';

angular.module('profile')
  .directive('dateValidator', function() {
    return {
      require: 'ngModel',
      link:    function(scope, element, attrs, ngModel) {

        ngModel.$validators.date = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          if (!value) return true;
          var split = value.split('.');
          if (split.length != 3) return false;
          var date = new Date(split[2], split[1]-1, split[0]);

          if (split[2].length != 4) return false;

          return date.getFullYear() == split[2] && date.getMonth() == split[1]-1 && date.getDate() == split[0];
        };
      }
    };

  });



