var LRU = require("lru-cache");

var cache = LRU({
  max: 100,
  maxAge: 12 * 3600 * 1000 // 12h
});

module.exports = cache;