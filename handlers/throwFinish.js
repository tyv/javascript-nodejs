/**
 * Adds this.throwFinish() to stop request processing
 * @constructor
 */

function FinishRequestProcessing() {
  this.message = "Finish request";
}

exports.init = function(app) {

  app.use(function*(next) {
    this.throwFinish = function() {
      throw new FinishRequestProcessing();
    };

    try {
      yield* next;
    } catch (err) {
      if (err instanceof FinishRequestProcessing) {
        this.log.debug("throwFinish cought");
        // do nothing
        return;
      } else {
        throw err;
      }
    }

  });

};
