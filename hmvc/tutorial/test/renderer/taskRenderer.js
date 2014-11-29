const app = require('app');

const TaskRenderer = require('../../renderer/taskRenderer');
const mongoose = require('lib/mongoose');
const Task = require('../../models/task');

describe("TaskRenderer", function() {

  beforeEach(function* () {
    yield Task.destroy();
  });

  it("renderContent", function* () {

    const task = new Task({
      "content":    "# Title\n\nContent",
      "slug":       "margin-between-pairs",
      "title":      "Title",
      "importance": 4,
      "solution":   "..."
    });
    const renderer = new TaskRenderer();

    const result = yield renderer.renderContent(task);

    result.replace(/\n/g, '').should.be.eql('<p>Content</p>');
  });


  it("renderSolution", function* () {

    const task = new Task({
      "content":    "# Title\n\nContent",
      "slug":       "margin-between-pairs",
      "title":      "Title",
      "importance": 4,
      "solution":   "# Part 1\n\nContent 1\n\n# Part 2\n\nContent 2"
    });
    const renderer = new TaskRenderer();

    const result = yield renderer.renderSolution(task);
/*
    result.replace(/\n/g, '').should.be.eql('<div class="spoiler closed"><button></button>
      <div class="spoiler__content"></p>
    <p>Content 1</p>
    </div>
    </div>
    <div class="spoiler closed"><button></button>
    <div class="spoiler__content"></p>
    <p>Content 2</div>
    </div>')
    */


  });
});
