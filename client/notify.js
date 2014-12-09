var humane = require('humane-js');

window.info = exports.info = humane.spawn({ addnCls: 'humane-libnotify-info', timeout: 3000 });
window.success = exports.success = humane.spawn({ addnCls: 'humane-libnotify-success', timeout: 3000 });
window.warning = exports.warning = humane.spawn({ addnCls: 'humane-libnotify-warning', timeout: 3000 });
window.error = exports.error = humane.spawn({ addnCls: 'humane-libnotify-error', timeout: 3000 });
