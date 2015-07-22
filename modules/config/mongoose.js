module.exports = {
  "uri":     "mongodb://localhost/" + (
    process.env.NODE_ENV == 'test' ? "js_test" :
    process.env.NODE_LANG ? `js_${process.env.NODE_LANG}` :
      "js"
  ),
  "options": {
    "server": {
      "socketOptions": {
        "keepAlive": 1
      },
      "poolSize":      5
    }
  }
};
