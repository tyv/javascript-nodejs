'use strict';

const mongoose = require('mongoose');
const countries = require('countries');
const CourseFeedback = require('../models/courseFeedback');
const CourseGroup = require('../models/courseGroup');
const Course = require('../models/course');
const User = require('users').User;
const _ = require('lodash');
const CacheEntry = require('cache').CacheEntry;
const renderFeedback = require('../lib/renderFeedback');

exports.get = function*() {

  this.locals.course = yield Course.findOne({
    slug: this.params.course
  });

  if (!this.locals.course) {
    this.throw(404);
  }

  if (!this.query.partialMode) {

    this.locals.title = "Отзыв о курсе\n" + this.locals.course.title;

    // star => count
    let feedbackStats = yield* CacheEntry.getOrGenerate({
      key:  'courses:feedback:' + this.params.slug,
      tags: ['courses:feedback']
    }, getFeedbackStats.bind(this, this.locals.course));

    this.body = this.render('feedback/list', {
      stats: feedbackStats
    });

  } else {

    var skip = +this.query.skip || 0;
    var limit = 10;
    var filter = {
      isPublic: true
    };
    if (this.query.teacherId) {
      if (!mongoose.Types.ObjectId.isValid(this.query.teacherId)) this.throw(400, "teacherId is malformed");
      filter.teacherCache = this.query.teacherId;
    }
    if (this.query.stars) {
      filter.stars = +this.query.stars;
    }

    let feedbacks = yield CourseFeedback.find(filter).skip(skip).limit(limit);

    let feedbacksRendered = [];

    for (var i = 0; i < feedbacks.length; i++) {
      var feedback = feedbacks[i];

      feedbacksRendered.push(yield* renderFeedback(feedback, this.user));
    }

    this.locals.countries = countries.all;

    this.body = this.render('feedback/listItems', {
      courseFeedbacks: feedbacksRendered
    });

  }

};


function* getFeedbackStats(course) {

  let groups = yield CourseGroup.find({
    course: course.id
  });

  let groupIds = _.pluck(groups, '_id');

  let stats = yield CourseFeedback.aggregate([
    {
      $match: {
        group: {
          $in: groupIds
        }
      }
    },
    {
      $group: {
        _id:   '$stars',
        count: {
          $sum: 1
        }
      }
    }
  ]).exec();

  let totalFeedbacks = stats.reduce(function(prev, next) { return prev + next.count; }, 0);

  console.log(totalFeedbacks);
  // default stats (if no stars for a star)
  let starStatsPopulated = {};
  for(let i=1; i<=5; i++) starStatsPopulated[i] = {
    count: 0,
    fraction: 0
  };

  stats.forEach(function(stat) {
    starStatsPopulated[stat._id] = {
      count: stat.count,
      fraction: stat.count ? +(stat.count / totalFeedbacks).toFixed(2) : 0
    };
  });


  let recommendStats = yield CourseFeedback.aggregate([
    {
      $match: {
        group: {
          $in: groupIds
        }
      }
    },
    {
      $group: {
        _id:   '$recommend',
        count: {
          $sum: 1
        }
      }
    }
  ]).exec();


  recommendStats = _.groupBy(recommendStats, '_id');

  if (!recommendStats[true]) recommendStats[true] = [{count: 0}];
  if (!recommendStats[false]) recommendStats[false] = [{count: 0}];

  // 76% recommend
  let recommendFraction = recommendStats[true][0].count / (recommendStats[true][0].count + recommendStats[false][0].count);

  return {
    stars: starStatsPopulated,
    recommendFraction: recommendFraction,
    total: totalFeedbacks
  };
}
