
exports.get = function*() {

  var group = this.locals.group = this.groupBySlug;

  this.locals.title = "Отзыв\n" + group.title;

  this.body = this.render('groupFeedback/form');
};

exports.post = function*() {

};
