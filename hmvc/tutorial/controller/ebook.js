const mongoose = require('mongoose');
const Article = require('../models/article');
const Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const _ = require('lodash');

exports.get = function *get(next) {

  const topArticle = yield Article.findOne({slug: this.params.slug}).exec();
  if (!topArticle) {
    this.throw(404);
  }

  // gather all articles in locals.children array linearly with shifted headers
  var renderer = new ArticleRenderer();

  var renderedTop = yield* renderArticle(renderer, topArticle, 0, true);

  if (renderedTop.tasks.length) {
    renderedTop.hasTasks = true;
  }

  var locals = {};
  locals.children = [renderedTop];

  const tree = yield* Article.findTree({
    query: Article.find({}).sort({weight: 1})
  });

  const topArticleInTree = tree.byId(topArticle._id);

  if (topArticleInTree.isFolder) {
    var children = topArticleInTree.children || [];

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      var renderedChild = yield* renderArticle(renderer, child, 1, true);

      locals.children.push(renderedChild);

      if (renderedChild.tasks.length) {
        renderedChild.hasTasks = true;
        renderedTop.hasTasks = true;
      }

      if (child.isFolder) {
        var children2 = child.children || [];
        for (var j = 0; j < children2.length; j++) {
          var subChild = children2[j];
          console.log("render j=", j, subChild.title);

          var renderedSubChild = yield* renderArticle(renderer, subChild, 2, true);

          locals.children.push(renderedSubChild);
          if (renderedSubChild.tasks.length) {
            renderedSubChild.hasTasks = true;
            renderedChild.hasTasks = true;
            renderedTop.hasTasks = true;
          }
        }
      }

    }

  }

  // gather all head/foot data from the renderer, all libs etc
  locals.head = renderer.getHead();
  locals.foot = renderer.getFoot();

  console.log(require('util').inspect(locals, {depth: 7}));

  this.body = this.render("ebook", locals);

};

function *renderArticle(renderer, article, headerLevelShift, noStripTitle) {

  var rendered = yield* renderer.render(article, {
    headerLevelShift: headerLevelShift,
    noStripTitle:     noStripTitle,
    linkHeaderTag:    false,
    translitAnchors:  true
  });

  rendered.isFolder = article.isFolder;
  rendered.title = article.title;
  rendered.weight = article.weight;
  rendered.url = Article.getUrlBySlug(article.slug);
  rendered.modified = article.modified;
  rendered.level = headerLevelShift;

  delete rendered.head;
  delete rendered.foot;

  rendered.tasks = yield* renderTasks(article);

  return rendered;
}


function *renderTasks(article) {
  var tasks = yield Task.find({
    parent: article._id
  }).sort({weight: 1}).exec();

  const taskRenderer = new TaskRenderer();

  var renderedTasks = [];

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    var taskRendered = yield* taskRenderer.render(task);
    renderedTasks.push({
      url:        task.getUrl(),
      title:      task.title,
      importance: task.importance,
      content:    taskRendered.content,
      solution:   taskRendered.solution
    });

  }

  return renderedTasks;

}


