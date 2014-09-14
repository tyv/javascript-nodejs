
module.exports = function(app) {
  app.use(function*(next) {
    var d = new Date();
    yield next;
    console.log("time diff: " + (new Date() - d)/1000 + "s");
  });

};
