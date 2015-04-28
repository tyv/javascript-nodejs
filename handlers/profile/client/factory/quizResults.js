module.exports = ($resource) => {
  return $resource('/quiz/results/user/' + window.currentUser.id, {}, {
    query: {
      method:            'GET',
      isArray:           true,
      transformResponse: function(data, headers) {

        data = JSON.parse(data);
        data.forEach(function(result) {
          result.created = new Date(result.created);
        });
        return data;
      }
    }
  });
};
