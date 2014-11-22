var paypalConfig = require('config').payments.modules.paypal;

var signCart = require('../../signCart')(paypalConfig.myCertPath, paypalConfig.myKeyPath, paypalConfig.paypalCertPath);

describe("signCart", function() {

  it("signs a message", function*() {

    var signed = yield* signCart("cart content");

    var header = '-----BEGIN PKCS7-----';

    signed.slice(0, header.length).should.eql(header);

  });

});
