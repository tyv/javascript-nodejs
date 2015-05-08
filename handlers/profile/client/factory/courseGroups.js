var angular = require('angular');

angular.module('profile').factory('CourseGroups', ($resource) => {
  return $resource('/courses/profile/' + window.currentUser.id, {}, {
    query: {
      method:            'GET',
      isArray:           true,
      transformResponse: function(data, headers) {
        data = JSON.parse(data);
        data.forEach(function(group) {
          group.dateStart = new Date(group.dateStart);
          group.dateEnd = new Date(group.dateEnd);
        });

        return data;
      }
    }
  });
});
