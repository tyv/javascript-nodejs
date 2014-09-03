module.exports = function req(req) {
  if (!req || !req.connection)
    return req;
  return {
    method:        req.method,
    url:           req.url,
    headers:       req.headers,
    body:          req.body,
    remoteAddress: req.connection.remoteAddress,
    remotePort:    req.connection.remotePort
  };
};
