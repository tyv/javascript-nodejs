require('users').User;
require('newsletter').Newsletter;
require('newsletter').Subscription;
const ObjectId = require('mongoose').Types.ObjectId;

exports.User = [
  {
    "_id":           "000000000000000000000001",
    "created":       new Date(2014, 0, 1),
    "displayName":   "ilya kantor",
    "email":         "iliakan@gmail.com",
    "profileName":   "iliakan",
    "password":      "1234",
    "verifiedEmail": true
  },
  {
    "_id":           "000000000000000000000002",
    "created":       new Date(2015, 0, 1),
    "displayName":   "tester",
    "email":         "mk@javascript.ru",
    "profileName":   "mk",
    "password":      "1234",
    "verifiedEmail": true
  }
];

exports.Subscription = [
  {
    email:       'mk@javascript.ru',
    newsletters: [new ObjectId("100000000000000000000001")]
  }
];

exports.Newsletter = [
  {
    "_id":  "100000000000000000000001",
    title:  "Курс и скринкасты по Node.JS",
    slug:   "nodejs",
    period: "несколько раз в год",
    weight: 1
  },
  {
    "_id":  "100000000000000000000002",
    title:  "Курс JavaScript/DOM/интерфейсы",
    period: "раз в 1.5-2 месяца",
    weight: 0,
    slug:   "js"
  },
  {
    "_id":  "100000000000000000000003",
    title:  "Продвинутые курсы, мастер-классы и конференции по JavaScript",
    period: "редко",
    weight: 2,
    slug:   "advanced"
  }
];

