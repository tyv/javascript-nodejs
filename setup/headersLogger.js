
module.exports = function(app) {

  app.use(function*(next) {
    for (var name in this.req.headers) {
      console.log(name + ": " + this.req.headers[name]);
    }

    yield next;
  });
};
