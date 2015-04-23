var angular = require('./angular');

// usage:
// +e('input').control(focus-on="meForms.displayName.editing")
// focuses input then editing becomes true
angular.module('focusOn', [])
  .directive('focusOn', function($timeout) {
    return {
      scope:    {trigger: '=focusOn'},
      link:     function(scope, element) {
        scope.$watch('trigger', function(value) {
          if (value) {
            $timeout(function() {
              element[0].focus();
            });
          }
        });
      }
    };
  });