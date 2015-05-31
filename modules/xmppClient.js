'use strict';

var util = require('util');
var xmpp = require('node-xmpp');
var co = require('co');
var config = require('config');
var log = require('log')();
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

/**
 * Wrapper over xmpp-client
 * - Promise-based calls
 * - Handles errors, promises reject & connection close if any (can be changed later)
 */
class Client extends EventEmitter {
  constructor(options) {
    super(options);
    this.options = options;

    this.promiseRejectHooks = [];
    this.on('error', this.onerror.bind(this));
  }

  onerror(error) {
    // if error happens without promises, we just log it
    log.error("Error:", error);
    log.error("Promises:", this.promiseRejectHooks.length);

    // reject current promises
    // new promises have a change to appear while rejecting,
    // so this look instead of forEach
    while (this.promiseRejectHooks.length) {
      var reject = this.promiseRejectHooks[0];
      reject(error); // should cleanup it's hook from the list
    }

    this.disconnect();
  }

  disconnect() {
    this.client.connection.socket.removeAllListeners(); // otherwise, will be ECONNRESET error
    this.client.end();
  }

  connect() {

    this.client = new xmpp.Client({
      jid:      this.options.jid, // config.xmpp.admin.login + '/host',
      password: this.options.password // config.xmpp.admin.password
    });

    // up to 100 simultaneous requests to server, each has an on('stanza') listener awaiting for the response w/ same id
    this.client.setMaxListeners(100);

    this.client.connection.socket.on('error', this.emit.bind(this, 'error'));

    this.client.on('error', function(err) {
      if (typeof err == 'string') err = new Error(err);
      this.emit('error', err);
    }.bind(this));

    return this.makePromise(function(resolve, reject) {
      this.client.on('online', function(jidData) {
        // jidData only has jid
        resolve(jidData.jid);
      });
    });


  }

  /**
   * Make a promise that adds its reject handle to the list
   * And removes after resolve/reject
   * (this handle will be called onerror, e.g. on connection drop)
   * @param f
   * @returns {Promise}
   */
  makePromise(f) {
    var self = this;

    return new Promise(function(resolve, reject) {

      function newResolve(result) {
        cleanup();
        resolve(result);
      }

      function newReject(error) {
        cleanup();
        reject(error);
      }

      function cleanup() {
        self.promiseRejectHooks.splice(self.promiseRejectHooks.indexOf(newReject), 1);
      }


      self.promiseRejectHooks.push(newReject);

      f.call(self, newResolve, newReject);
    });
  }

  send(data) {
    data = data.tree();
    data.attrs.id = Math.random().toString(36).slice(2);

    return this.makePromise(function(resolve, reject) {

      this.client.on('stanza', function onStanza(stanza) {
        if (stanza.attrs.id != data.attrs.id) return;
        this.client.removeListener('stanza', onStanza);

        console.log("<-- ", stanza.toString());

        if (stanza.attrs.type == 'error') {
          reject(new Error("Error response " + stanza));
          return;
        }

        resolve(stanza);
      }.bind(this));

      console.log("--> ", data.toString());
      this.client.send(data);

    });
  }

  // @see workflow at http://xmpp.org/extensions/xep-0045.html#createroom-general
  *createRoom(options) {
    options = Object.create(options);
    var roomJid = options.roomName + '@conference.' + this.client.jid.domain;
    options.membersOnly = "membersOnly" in options ? String(+options.membersOnly) : '1';
    // <presence to='123@conference.javascript.ru/host'>
    //   <x xmlns='http://jabber.org/protocol/muc'/>
    // </presence>

    var stanza;
    var iq;

    // Example 153, create room
    var presence = new xmpp.Element(
      'presence',
      {from: this.client.jid, to: roomJid + '/host'}
    )
      .c('x', {'xmlns': 'http://jabber.org/protocol/muc'});

    // Example 154, new or existing room
    stanza = yield this.send(presence);

    var statuses = stanza.is('presence') &&
      stanza.getChild('x') &&
      stanza.getChild('x').getChildrenByFilter(function(c) {
        return c.name == 'status';
      });

    assert(statuses);

    var statusCodes = statuses.map(function(s) {
      return s.attrs.code;
    }).sort().join(',');

    var isNewRoom = (statusCodes == '110,201');
    var isExistingRoom = (statusCodes == '110');

    assert(isNewRoom || isExistingRoom);

    // Example 156 or 163, request config form
    iq = new xmpp.Element('iq', {to: roomJid, from: this.client.jid, type: 'get'})
      .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'});

    // Example 157, service sends config form
    stanza = yield this.send(iq);

    var isConfigrationForm = stanza.is('iq') &&
      stanza.getChild('query') &&
      stanza.getChild('query').getChild('x') &&
      stanza.getChild('query').getChild('x').attrs.type == 'form';

    assert(isConfigrationForm);

    // <iq type='set' id='purple1f762131' to='roomtname@conference.javascript.ru'>
    // <query xmlns='http://jabber.org/protocol/muc#owner'>
    // <x xmlns='jabber:x:data' type='submit'>
    // <field var='FORM_TYPE'><value>http://jabber.org/protocol/muc#roomconfig</value></field>
    // <field var='muc#roomconfig_roomdesc'><value></value></field>
    // <field var='muc#roomconfig_persistentroom'><value>1</value></field>
    // <field var='muc#roomconfig_publicroom'><value>0</value></field>
    // <field var='public_list'><value>0</value></field>
    // <field var='muc#roomconfig_passwordprotectedroom'><value>0</value></field>
    // <field var='muc#roomconfig_roomsecret'><value></value></field>
    // <field var='muc#roomconfig_maxusers'><value>200</value></field>
    // <field var='muc#roomconfig_whois'><value>moderators</value></field>
    // <field var='muc#roomconfig_membersonly'><value>1</value></field>
    // <field var='muc#roomconfig_moderatedroom'><value>0</value></field>
    // <field var='members_by_default'><value>1</value></field>
    // <field var='muc#roomconfig_changesubject'><value>0</value></field>
    // <field var='allow_private_messages'><value>1</value></field>
    // <field var='allow_private_messages_from_visitors'><value>anyone</value></field>
    // <field var='allow_query_users'><value>1</value></field>
    // <field var='muc#roomconfig_allowinvites'><value>0</value></field>
    // <field var='muc#roomconfig_allowvisitorstatus'><value>1</value></field>
    // <field var='muc#roomconfig_allowvisitornickchange'><value>1</value></field>
    // <field var='muc#roomconfig_allowvoicerequests'><value>0</value></field>
    // <field var='muc#roomconfig_voicerequestmininterval'><value>1800</value></field>
    // <field var='muc#roomconfig_captcha_whitelist'/>
    // <field var='muc#roomconfig_enablelogging'><value>1</value></field>
    // </x></query></iq>

    iq = new xmpp.Element(
      'iq',
      {to: roomJid, from: this.client.jid, type: 'set'})
      .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
      .c('x', {xmlns: "jabber:x:data", type: "submit"});

    //set room to be hidden by sending configuration. ref: http://xmpp.org/extensions/xep-0045.html
    iq.c('field', {'var': 'FORM_TYPE'}).c('value').t('http://jabber.org/protocol/muc#roomconfig').up().up()
      .c('field', {'var': 'muc#roomconfig_roomname'}).c('value').t('').up().up()
      .c('field', {'var': 'muc#roomconfig_roomdesc'}).c('value').t('').up().up()
      .c('field', {'var': 'muc#roomconfig_persistentroom'}).c('value').t('1').up().up()
      .c('field', {'var': 'muc#roomconfig_publicroom'}).c('value').t('0').up().up()
      .c('field', {'var': 'public_list'}).c('value').t('0').up().up()
      .c('field', {'var': 'muc#roomconfig_passwordprotectedroom'}).c('value').t('0').up().up()
      .c('field', {'var': 'muc#roomconfig_roomsecret'}).c('value').t('').up().up()
      .c('field', {'var': 'muc#roomconfig_maxusers'}).c('value').t('200').up().up()
      .c('field', {'var': 'muc#roomconfig_whois'}).c('value').t('moderators').up().up()
      .c('field', {'var': 'muc#roomconfig_membersonly'}).c('value').t(options.membersOnly).up().up()
      .c('field', {'var': 'muc#roomconfig_moderatedroom'}).c('value').t('0').up().up()
      .c('field', {'var': 'members_by_default'}).c('value').t('1').up().up()
      .c('field', {'var': 'muc#roomconfig_changesubject'}).c('value').t('0').up().up()
      .c('field', {'var': 'allow_private_messages'}).c('value').t('1').up().up()
      .c('field', {'var': 'allow_private_messages_from_visitors'}).c('value').t('anyone').up().up()
      .c('field', {'var': 'allow_query_users'}).c('value').t('1').up().up()
      .c('field', {'var': 'muc#roomconfig_allowinvites'}).c('value').t('0').up().up()
      .c('field', {'var': 'muc#roomconfig_allowvisitorstatus'}).c('value').t('1').up().up()
      .c('field', {'var': 'muc#roomconfig_allowvisitornickchange'}).c('value').t('1').up().up()
      .c('field', {'var': 'muc#roomconfig_allowvoicerequests'}).c('value').t('1').up().up()
      .c('field', {'var': 'muc#roomconfig_voicerequestmininterval'}).c('value').t('1800').up().up()
      .c('field', {'var': 'muc#roomconfig_captcha_whitelist'}).up()
      // if mod_muc_log is not enabled, then this line will give 406 error
      .c('field', {'var': 'muc#roomconfig_enablelogging'}).c('value').t('1').up().up();

    stanza = yield this.send(iq);

    // Example 160, room created/modified successfully
    var isOk = stanza.is('iq') &&
      (stanza.attrs.type == 'result');

    assert(isOk);

    return roomJid;
  }

  *grantMember(roomJid, memberJid, nick) {
    // Example 120, Admin grants membership

    var item = {affiliation: 'member', jid: memberJid};
    if (nick) item.nick = nick;

    var iq = new xmpp.Element('' +
      'iq', {to: roomJid, from: this.client.jid, type: 'set'})
      .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
      .c('item', item)
      .c('reason').t('welcome').up().up().up();

    var stanza = yield this.send(iq);

    var isOk = stanza.is('iq') &&
      (stanza.attrs.type == 'result');

    assert(isOk);

  }

}

module.exports = Client;




/*
if (!module.parent) {
  // Usage example
  co(function*() {

    var client = new Client({
      jid:      config.xmpp.admin.login + '/host',
      password: config.xmpp.admin.password
    });

    yield client.connect();

    var roomJid = yield client.createRoom("bla");

    yield client.grantMember(roomJid, "tester");

    client.disconnect();

  }).then(function() {
    console.log("done");
  }, function(err) {
    console.log(err.message, err.stack);
  });

}
*/
