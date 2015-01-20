var i18n = require("i18next");

i18n.init({
  lng: process.env.NODE_LANG || 'en',
  supportedLngs: ['en', 'ru'],
  fallbackLng: false,
  saveMissing: true,
  sendMissingTo : 'all',
  debug: process.env.NODE_ENV == 'development'
});
