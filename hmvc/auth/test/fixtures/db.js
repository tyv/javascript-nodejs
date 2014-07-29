exports.User = [
  { "_id": "000000000000000000000001",
    "created": new Date(2014,0,1),
    "username": "ilya kantor",
    "email": "iliakan@gmail.com",
    "password": "123",
    "avatar": "1.jpg",
    "following": []
  },
  { "_id": "000000000000000000000002",
    "created": new Date(2014,0,1),
    "username": "tester",
    "email": "tester@mail.com",
    "password": "123",
    "avatar": "2.jpg",
    "following": ["000000000000000000000001"]
  },
  { "_id": "000000000000000000000003",
    "created": new Date(2014,0,1),
    "username": "vasya",
    "email": "vasya@mail.com",
    "password": "123",
    "avatar": "3.jpg",
    "following": ["000000000000000000000001", "000000000000000000000002"]
  }
];