var elasticClient = require('elastic').client;

var Task = require('tutorial').Task;
var Article = require('tutorial').Article;

// known types and methods to convert hits to showable results
// FIXME: many queries to MongoDB for parents (breadcrumbs) Cache them?
var searchTypes = {
  articles: {
    title: 'Учебник',
    hit2url: function(hit) {
      return Article.getUrlBySlug(hit.fields.slug[0]);
    },
    hit2breadcrumb: function*(hit) {
      var article = yield Article.findById(hit._id).select('slug title isFolder parent').exec();
      var parents = yield* article.findParents();
      parents.forEach(function(parent) {
        parent.url = parent.getUrl();
      });
      return parents;
    }
  },

  tasks: {
    title: 'Задачи',
    hit2url: function(hit) {
      return Task.getUrlBySlug(hit.fields.slug[0]);
    },
    hit2breadcrumb: function*(hit) {
      var task = yield Task.findById(hit._id).select('slug title parent').exec();
      var article = yield Article.findById(task.parent).select('slug title isFolder parent').exec();
      var parents = (yield* article.findParents()).concat(article);
      parents.forEach(function(parent) {
        parent.url = parent.getUrl();
      });
      return parents;
    }
  }

};

exports.get = function *get(next) {

  var locals = {};
  locals.sitetoolbar = true;
  locals.sidebar = false;

  var searchQuery = locals.searchQuery = this.request.query.query || '';
  var searchType = locals.searchType = this.request.query.type || 'articles';

  if (!searchTypes[searchType]) {
    this.throw(400);
  }

  locals.searchTypes = searchTypes;

  if (searchQuery) {
    var result = yield* search(searchQuery, searchType);
    var hits = result.hits.hits;
    locals.results = [];

    for (var i = 0; i < hits.length; i++) {
      var hit = hits[i];
      locals.results.push({
        url: searchTypes[hit._type].hit2url(hit),
        title: hit.highlight.title ? hit.highlight.title.join('… ') : hit.fields.title[0],
        search: hit.highlight.search.join('… '),
        breadcrumb: yield* searchTypes[hit._type].hit2breadcrumb(hit)
      });
    }
  }

  this.body = this.render("index", locals);

};


function* search(query, type) {

  /*jshint -W106 */
  var queryBody = {
    size: 50,
    filter:    {
      bool:  {
        must_not: {
          term: {isFolder: true}
        }
      }
    },
    query:     {
      multi_match: {
        query:  query,
        fields: ['title^10', 'search']
      }
    },
    fields:    ["title", "slug"],
    highlight: {
      pre_tags : ["<mark class=\"search-results__marked\">"],
      post_tags : ["</mark>"],
      fields: {
        search: {type: 'postings'},
        title:  {type: 'plain'}
      }
    }
  };

  var result = yield elasticClient().search({
    index: 'js',
    type:  type,
    body:  queryBody
  });

  return result;
}