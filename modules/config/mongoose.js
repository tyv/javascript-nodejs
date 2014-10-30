module.exports = {
  "uri": "mongodb://localhost/" + (process.env.NODE_ENV == 'test' ? "js_test" : "js"),
  "options": {
    "server": {
      "socketOptions": {
        "keepAlive": 1
      },
      "poolSize":      5
    }
  }
};