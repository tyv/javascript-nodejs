const mongoose = require('mongoose');

var Course = require('courses').Course;
var CourseGroup = require('courses').CourseGroup;
var CourseInvite = require('courses').CourseInvite;

exports.Course = [
  {
    "_id": "543250000000000000000002",
    slug:  "js",
    videoKeyTag: "js",
    title: "Курс JavaScript/DOM/интерфейсы",
    shortDescription: `"Правильный" курс по профессиональному JavaScript, цель которого – научить думать на JavaScript, писать просто, быстро и красиво.`,
    isListed: true,
    weight: 1
  },
  {
    "_id": "543250000000000000000003",
    slug:  "nodejs",
    videoKeyTag: "nodejs",
    title: "Курс по Node.JS",
    shortDescription: `Грамотная разработка на платформе Node.JS (серверный JavaScript).`,
    isListed: true,
    weight: 2
  }
];

exports.CourseInvite = [];

exports.CourseGroup = [
  {
    course: '543250000000000000000002',
    dateStart: new Date(2016, 0, 1),
    dateEnd: new Date(2016, 10, 10),
    timeDesc: "пн/чт 19:30 - 21:00 GMT+3",
    slug: 'js-1',
    price: 1,
    participantsLimit: 30,
    webinarId: '123',
    isListed: true,
    isOpenForSignup: true,
    title: "Курс JavaScript/DOM/интерфейсы (01.01)"
  },
  {
    course: '543250000000000000000002',
    dateStart: new Date(2016, 5, 1),
    dateEnd: new Date(2016, 11, 10),
    timeDesc: "пн/чт 21:30 - 23:00 GMT+3",
    slug: 'js-2',
    price: 1,
    webinarId: '456',
    participantsLimit: 30,
    isListed: true,
    isOpenForSignup: true,
    title: "Курс JavaScript/DOM/интерфейсы (06.01)"
  }
];

