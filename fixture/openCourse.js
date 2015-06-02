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
    dateStart:         new Date(2015, 5, 18),
    dateEnd:           new Date(2015, 7, 18),
    timeDesc:          "пн/чт 21:30 - 23:00 GMT+3",
    slug:              'js-20150618',
    price:             21000,
    participantsLimit: 50,
    webinarId:         '145468211',
    isListed:          true,
    isOpenForSignup:   true,
    title:             "Курс JavaScript/DOM/интерфейсы (18.06)"
  },
  {
    course:            '5569b7fc097bf243c1d54e5b',
    dateStart:         new Date(2015, 5, 16),
    dateEnd:           new Date(2015, 6, 14),
    timeDesc:          "вт/пт 21:30 - 23:00 GMT+3",
    slug:              'nodejs-20150616',
    price:             13500,
    participantsLimit: 30,
    webinarId:         '150179171',
    isListed:          true,
    isOpenForSignup:   true,
    title:             "Курс Node.JS (16.06)"
  },
  {
    course:            '5569b7fc097bf243c1d54e5b',
    dateStart:         new Date(2015, 5, 30),
    dateEnd:           new Date(2015, 6, 28),
    timeDesc:          "вт/пт 19:30 - 21:00 GMT+3",
    slug:              'nodejs-20150630',
    price:             13500,
    participantsLimit: 30,
    webinarId:         '149647499',
    isListed:          true,
    isOpenForSignup:   true,
    title:             "Курс Node.JS (30.06)"
  }
];

exports.VideoKey = [];
for(var i=0; i<50; i++) exports.VideoKey.push({key: "см. в старом кабинете-" + i.toString(36), tag: 'js'});
