var angular = require('angular');

angular.module('profile').factory('Newsletters', ($resource) => {
  return $resource('/newsletter/profile/' + window.currentUser.id, {}, {
    query: {
      method:            'GET',
      isArray:           true,
      transformResponse: function(data) {
        data = JSON.parse(data);
        return data;
      }
    }
  });
});
