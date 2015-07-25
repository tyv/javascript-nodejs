var i18n = require("i18next");

i18n.init({
  lng:           process.env.NODE_LANG || 'ru',
  supportedLngs: ['en', 'ru'],
  fallbackLng:   'en',
  saveMissing:   false,
  sendMissingTo: 'ru',
  debug:         process.env.NODE_ENV == 'development'
});

