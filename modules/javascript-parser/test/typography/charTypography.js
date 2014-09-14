var charTypography = require('../../typography/charTypography');

describe("charTypography", function() {

  it("replaces char sequences", function() {
    var data = 'My (c) -- 1 +- -> b <- 2 ...';
    charTypography(data).should.eql("My © — 1 ± → b ← 2 …");
  });

});
