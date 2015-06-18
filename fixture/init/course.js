const mongoose = require('mongoose');

var Course = require('courses').Course;
var CourseGroup = require('courses').CourseGroup;
var CourseInvite = require('courses').CourseInvite;
var oid = require('oid');

exports.Course = [
  {
    "_id":            oid('course-js'),
    slug:             "js",
    videoKeyTag:      "js",
    title:            "Курс JavaScript/DOM/интерфейсы",
    shortDescription: `"Правильный" курс по профессиональному JavaScript, цель которого – научить думать на JavaScript, писать просто, быстро и красиво.`,
    isListed:         true,
    weight:           1
  },
  {
    "_id":            oid('course-nodejs'),
    slug:             "nodejs",
    videoKeyTag:      "js",
    title:            "Курс по Node.JS",
    shortDescription: `Профессиональная разработка на платформе Node.JS/IO.JS (серверный JavaScript), с использованием современных фреймворков и технологий.`,
    isListed:         true,
    weight:           2
  }
];

exports.CourseInvite = [];
exports.CourseParticipant = [];
exports.CourseFeedback = [];

exports.CourseGroup = [
  {
    course:            oid('course-js'),
    dateStart:         new Date(2016, 0, 1),
    dateEnd:           new Date(2016, 10, 10),
    timeDesc:          "пн/чт 19:30 - 21:00 GMT+3",
    slug:              'js-1',
    price:             1,
    participantsLimit: 30,
    webinarId:         '123',
    isListed:          true,
    isOpenForSignup:   false,
    title:             "Курс JavaScript/DOM/интерфейсы (01.01)"
  },
  {
    course:            oid('course-nodejs'),
    dateStart:         new Date(2016, 6, 1),
    dateEnd:           new Date(2016, 11, 10),
    timeDesc:          "пн/чт 21:30 - 23:00 GMT+3",
    slug:              'js-2',
    price:             1,
    webinarId:         '456',
    participantsLimit: 30,
    isListed:          true,
    isOpenForSignup:   false,
    title:             "Курс JavaScript/DOM/интерфейсы (06.01)"
  },
  {
    course:            oid('course-nodejs'),
    dateStart:         new Date(2016, 6, 1),
    dateEnd:           new Date(2016, 11, 10),
    timeDesc:          "пн/чт 21:30 - 23:00 GMT+3",
    slug:              "nodejs-01",
    price:             1,
    webinarId:         '789',
    participantsLimit: 30,
    isListed:          true,
    isOpenForSignup:   false,
    title:             "Курс по Node.JS"
  }
];

