const mongoose = require('mongoose');

var Course = require('courses').Course;
var CourseGroup = require('courses').CourseGroup;

exports.Course = [
  {
    "_id": "543250000000000000000002",
    slug:  "js",
    title: "Курс JavaScript/DOM/интерфейсы",
    weight: 1
  }
];


exports.CourseGroup = [
  {
    course: '543250000000000000000002',
    dateStart: new Date(2015, 0, 1),
    dateEnd: new Date(2015, 10, 10),
    timeDesc: "пн/чт 19:30 - 21:00 GMT+3",
    slug: 'js-1',
    participantsLimit: 30,
    title: "Курс JavaScript/DOM/интерфейсы",
  }
];

