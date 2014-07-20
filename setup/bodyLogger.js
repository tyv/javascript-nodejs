
module.exports = function(app) {

  app.use(function*(next) {
    if (this.request.body) {
      console.log(this.request.body);
    }
    yield next;
  });
};
