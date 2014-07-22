exports.get = function*(next) {
  yield* this.loadOrder();

  this.body = 'THANK YOU';
};
