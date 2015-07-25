
// FIXME: add flash deletion?
exports.init = function(app) {
  // koa-flash is broken
  // reading from one object, writing to another object
  // occasionally writing to default
  app.use(function *flash(next) {
    this.flash = this.session.flash || {};

    this.session.flash = {};

    Object.defineProperty(this, 'newFlash', {
      get: function() {
        return this.session.flash;
      },
      set: function(val) {
        this.session.flash = val;
      }
    });

    yield *next;

    // now this.session can be null
    // (logout does that)

    if (this.session && Object.keys(this.session.flash).length === 0) {
      // don't write empty flash
      delete this.session.flash;
    }

    if (this.status == 302 && this.session && !this.session.flash) {
      // pass on the flash over a redirect
      this.session.flash = this.flash;
    }
  });

  app.use(function*(next) {

    var notificationTypes = ["error", "warning", "info", "success"];

    // by default koa-flash uses same defaultValue object for all flashes,
    // this.flash.message writes to defaultValue!

    this.addFlashMessage = function(type, html) {
      // split this.flash from defaultValue (fix bug in koa-flash!)
      if (!this.newFlash.messages) {
        this.newFlash.messages = [];
      }

      if (!~notificationTypes.indexOf(type)) {
        throw new Error("Unknown flash type: " + type);
      }

      this.newFlash.messages.push({
        type: type,
        html: html
      });
    };

    yield* next;

  });
};
