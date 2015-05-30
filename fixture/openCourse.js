const mongoose = require('mongoose');

var Course = require('courses').Course;
var CourseGroup = require('courses').CourseGroup;
var Discount = require('payments').Discount;
var CourseInvite = require('courses').CourseInvite;
var VideoKey = require('videoKey').VideoKey;

exports.Course = [
  {
    "_id":            "5569b7fc097bf243c1d54e5b",
    slug:             "js",
    videoKeyTag:      "js",
    title:            "Курс JavaScript/DOM/интерфейсы",
    shortDescription: `"Правильный" курс по профессиональному JavaScript, цель которого – научить думать на JavaScript, писать просто, быстро и красиво.`,
    isListed:         true,
    weight:           1
  }
];

exports.CourseInvite = [];
exports.CourseParticipant = [];
exports.CourseFeedback = [];

exports.Discount = [{
  module: 'courses',
  data: {
    slug: 'js-1'
  },
  discount: 1,
  code: '14052015'
}];

exports.CourseGroup = [
  {
    course:            '5569b7fc097bf243c1d54e5b',
    dateStart:         new Date(2015, 4, 14),
    dateEnd:           new Date(2015, 6, 16),
    timeDesc:          "пн/чт 19:30 - 21:00 GMT+3",
    slug:              'js-1',
    price:             99999,
    participantsLimit: 40,
    webinarId:         '116500571',
    isListed:          false,
    isOpenForSignup:   true,
    title:             "Курс JavaScript/DOM/интерфейсы (14.05)"
  }
];

exports.VideoKey = [];
for(var i=0; i<50; i++) exports.VideoKey.push({key: "см. в старом кабинете-" + i.toString(36), tag: 'js'});
