module.exports = ($resource) => {
  return $resource('/users/me', {}, {
    get: {
      method:            'GET',
      transformResponse: function(data, headers) {
        data = JSON.parse(data);
        data.created = new Date(data.created);
        return data;
      }
    }
  });
};
