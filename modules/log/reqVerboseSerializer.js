module.exports = function req(req) {
  if (!req || !req.connection)
    return req;
  return {
    method:        req.method,
    url:           req.url,
    headers:       req.headers,
    remoteAddress: req.connection.remoteAddress,
    remotePort:    req.connection.remotePort
  };
  // Trailers: Skipping for speed. If you need trailers in your app, then
  // make a custom serializer.
  //if (Object.keys(trailers).length > 0) {
  //  obj.trailers = req.trailers;
  //}
};
