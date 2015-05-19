var uploadStream = require('./uploadStream');

module.exports = function*(fileName, buffer) {
  // the same code actually
  return yield* uploadStream(fileName, buffer.length, buffer);
};
