exports.init = function(app) {

  app.use(function* saveLastUserActivityOncePerMinute(next) {

    var minuteAgo = new Date();
    minuteAgo.setMinutes(minuteAgo.getMinutes() - 1);

    if (this.user && (!this.user.lastActivity || this.user.lastActivity < minuteAgo)) {
      this.user.lastActivity = new Date();
      yield this.user.persist();
    }

    yield* next;
  });

};

