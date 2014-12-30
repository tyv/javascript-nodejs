var elastic = require('../lib/elastic');

var allowedTypes = ['articles', 'tasks'];

// types=articles,tasks&onlyTitle=1&query=blabla
exports.get = function*() {

  console.log(this.query);
  var types = this.query.types ? this.query.types.split(',').filter(function(type) {
    return ~allowedTypes.indexOf(type);
  }) : allowedTypes;

  var queryFields = this.query.onlyTitle ? ['title'] : ['title^10', 'search'];

  var size = 100;
  if (+this.query.size) size = Math.min(+this.query.size, size);

  /*jshint -W106 */
  var queryBody = {
    size: size,
    filter:    {
      bool:  {
        must_not: {
          term: {isFolder: true}
        }
      }
    },
    query:     {
      multi_match: {
        query:  this.query.query,
        fields: queryFields
      }
    },
    fields:    ["title", "slug"],
    highlight: {
      fields: {
        search: {type: 'postings'},
        title:  {type: 'plain'}
      }
    }
  };

  var result = yield elastic.search({
    index: 'js',
    type:  types.join(','),
    body:  queryBody
  });

  // total number of results (maybe more than size)
  var total = result.hits.total;

  var docs = result.hits;

  this.body = result;
};