module.exports = function(req) {
  if (!req || !req.connection) {
    return req;
  }
  return {
    method: req.method,
    url:    req.url
  };
};
