var elasticsearch = require('elasticsearch');

var client;
module.exports = function() {
  if (!client) client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
  });

  return client;
};

