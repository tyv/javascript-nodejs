const mongoose = require('mongoose');
const Article = require('../models/article');
const Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');

exports.get = function *get(next) {

  const article = yield Article.findOne({slug: this.params.slug}).exec();
  if (!article) {
    this.throw(404);
  }

  var renderer = new ArticleRenderer();

  var rendered = yield* renderer.render(article);

  rendered.isFolder = article.isFolder;
  rendered.modified = article.modified;
  rendered.title = article.title;
  rendered.weight = article.weight;

  var locals = rendered;
  locals.children = [];

  const tree = yield* Article.findTree({
    query: Article.find({}).sort({weight: 1})
  });

  const articleInTree = tree.byId(article._id);

  if (articleInTree.isFolder) {
    var children = articleInTree.children || [];

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      console.log("render i=", i, "/", children.length, child.title);

      console.log(child);
      var rendered = yield* renderer.render(child, {
        headerLevelShift: 1,
        noStripTitle: true
      });

      rendered.isFolder = child.isFolder;
      rendered.title = child.title;
      rendered.weight = child.weight;
      rendered.url = Article.getUrlBySlug(child.slug);

      delete rendered.head;
      delete rendered.foot;
      locals.children.push(rendered);

      if (child.isFolder) {
        var children2 = child.children || [];
        for (var j = 0; j < children2.length; j++) {
          var subChild = children2[j];
          console.log("render j=", j, subChild.title);

          var rendered = yield* renderer.render(subChild,  {
            headerLevelShift: 2,
            noStripTitle: true
          });

          rendered.title = subChild.title;
          rendered.weight = subChild.weight;
          rendered.url = Article.getUrlBySlug(subChild.slug);

          delete rendered.head;
          delete rendered.foot;

          locals.children.push(rendered);
        }
      }

    }

  }


  // gather all head/foot data from the renderer, all libs etc
  locals.head = renderer.getHead();
  locals.foot = renderer.getFoot();

  console.log(locals);
  this.body = this.render("ebook", locals);

};

// body
// metadata
// modified
// title
// isFolder
// prev
// next
// path
// siblings
function* renderArticle(slug) {


  yield* renderTasks();

  function *renderTasks() {
    var tasks = yield Task.find({
      parent: article._id
    }).sort({weight: 1}).exec();

    const taskRenderer = new TaskRenderer();


    rendered.tasks = [];

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];

      var taskRendered = yield* taskRenderer.renderWithCache(task);
      rendered.tasks.push({
        url:        task.getUrl(),
        title:      task.title,
        importance: task.importance,
        content:    taskRendered.content,
        solution:   taskRendered.solution
      });

    }

  }

  return rendered;

}

