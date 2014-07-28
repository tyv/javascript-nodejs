
exports.post = function* (next) {
  yield* this.loadTransaction();

  this.redirectToOrder();
};
