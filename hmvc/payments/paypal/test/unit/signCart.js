var signCart = require('../../signCart');
var paypalConfig = require('config').payments.modules.paypal;

describe("signCart", function() {

  it("signs a message", function*() {

    var signed = yield signCart("cart content",
      paypalConfig.myCertPath, paypalConfig.myKeyPath, paypalConfig.paypalCertPath);

    var header = '-----BEGIN PKCS7-----';

    signed.slice(0, header.length).should.eql(header);

  });

});
