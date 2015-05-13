"use strict";

// Copyright 2012 Mark Cavage, Inc.  All rights reserved.
// from restify
var Stream = require('stream').Stream;
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var LRU = require('lru-cache');
var os = require('os');

///--- Globals

var sprintf = util.format;

// every node.js run, in every process this id will be different
var PROCESS_ID = os.hostname() + '-' + process.pid;

///--- Helpers

function appendStream(streams, s) {
  assert.arrayOfObject(streams, 'streams');
  assert.object(s, 'stream');

  if (s instanceof Stream) {
    streams.push({
      raw:    false,
      stream: s
    });
  } else {
    assert.optionalBool(s.raw, 'stream.raw');
    assert.object(s.stream, 'stream.stream');
    streams.push(s);
  }
}


///--- API

/**
 * A Bunyan stream to capture records in a ring buffer and only pass through
 * on a higher-level record. E.g. buffer up all records but only dump when
 * getting a WARN or above.
 *
 * @param {Object} options contains the parameters:
 *      - {Object} stream The stream to which to write when dumping captured
 *        records. One of `stream` or `streams` must be specified.
 *      - {Array} streams One of `stream` or `streams` must be specified.
 *      - {Number|String} level The level at which to trigger dumping captured
 *        records. Defaults to bunyan.WARN.
 *      - {Number} maxRecords Number of records to capture. Default 100.
 *      - {Number} maxRequestIds Number of simultaneous request id capturing
 *        buckets to maintain. Default 1000.
 */
class RequestCaptureStream extends Stream {
  constructor(opts) {
    super();

    assert.object(opts, 'options');
    assert.optionalObject(opts.stream, 'options.stream');
    assert.optionalArrayOfObject(opts.streams, 'options.streams');
    assert.optionalNumber(opts.level, 'options.level');
    assert.optionalNumber(opts.maxRecords, 'options.maxRecords');
    assert.optionalNumber(opts.maxRequestIds, 'options.maxRequestIds');

    this.level = opts.level ? bunyan.resolveLevel(opts.level) : bunyan.WARN;
    this.limit = opts.maxRecords || 100;
    this.maxRequestIds = opts.maxRequestIds || 1000;
    this.requestMap = LRU({
      max: this.maxRequestIds
    });

    this._offset = -1;
    this._rings = [];

    this.streams = [];

    if (opts.streams) {
      opts.streams.forEach(appendStream.bind(null, this.streams));
    }

    this.haveNonRawStreams = false;
    for (var i = 0; i < this.streams.length; i++) {
      if (!this.streams[i].raw) {
        this.haveNonRawStreams = true;
        break;
      }
    }
  }


  write(record) {
    console.log(record);
    var reqId = record.requestId || PROCESS_ID;
    var ring;
    var self = this;

    if (!(ring = this.requestMap.get(reqId))) {
      if (++this._offset > this.maxRequestIds)
        this._offset = 0;

      if (this._rings.length <= this._offset) {
        this._rings.push(new bunyan.RingBuffer({
          limit: self.limit
        }));
      }

      ring = this._rings[this._offset];
      ring.records.length = 0;
      this.requestMap.set(reqId, ring);
    }

    assert.ok(ring, 'no ring found');

    ring.write(record);

    if (record.level >= this.level) {
      this.dump(ring);
    }
  }

  dump(ring) {

    var lastRecord = ring.records[ring.records.length - 1];
    var lastRequestId = lastRecord.requestId;

    var recordsToDump = [];

    if (!lastRequestId) {
      // error outside of request
      // no idea which context is required
      // let's dump everything context for the error
    }

    var i, r, ser;
    for (i = 0; i < ring.records.length; i++) {
      r = ring.records[i];
      if (this.haveNonRawStreams) {
        ser = JSON.stringify(r, bunyan.safeCycles()) + '\n';
      }
      this.streams.forEach(function(s) {
        s.stream.write(s.raw ? r : ser);
      });
    }
    ring.records.length = 0;

    var defaultRing = self.requestMap.get(PROCESS_ID);
    for (i = 0; i < defaultRing.records.length; i++) {
      r = defaultRing.records[i];
      if (this.haveNonRawStreams) {
        ser = JSON.stringify(r,
            bunyan.safeCycles()) + '\n';
      }
      self.streams.forEach(function(s) {
        s.stream.write(s.raw ? r : ser);
      });
    }
    defaultRing.records.length = 0;

  }

  toString() {
    var STR_FMT = '[object %s<level=%d, limit=%d, maxRequestIds=%d>]';

    return (sprintf(STR_FMT,
      this.constructor.name,
      this.level,
      this.limit,
      this.maxRequestIds));
  }


}


module.exports = RequestCaptureStream;
