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
    price: 1,
    participantsLimit: 30,
    webinarId: '123',
    title: "Курс JavaScript/DOM/интерфейсы (01.01)"
  },
  {
    course: '543250000000000000000002',
    dateStart: new Date(2015, 5, 1),
    dateEnd: new Date(2015, 11, 10),
    timeDesc: "пн/чт 21:30 - 23:00 GMT+3",
    slug: 'js-2',
    price: 1,
    webinarId: '456',
    participantsLimit: 30,
    title: "Курс JavaScript/DOM/интерфейсы (06.01)"
  }
];

