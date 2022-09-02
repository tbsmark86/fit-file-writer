// Adapted from fit-route project: 
// https://gitlab.com/nwholloway/fit-route/-/tree/8467d5baf7d8955f0e931074972796824d582ce2/public/js/fit/encoder.js
// Original License:
/*
MIT License

Copyright (c) 2019 Nick Holloway

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* global Blob */
import { Mesg } from './mesg.js';
import { crc } from './crc.js';

const HEADER_LEN = 14;
const PROTOCOL_VERSION = 0x10; // 1.0
const PROFILE_VERSION = 2078; // 20.78
const MAGIC = 0x2e464954; // ".FIT"

export class FITEncoder {
  constructor() {
    this.localNum = {};
    this.mesgDefn = [];
    this.messages = [];
  }

  writeFileId(values) {
    this.writeMesg('file_id', values);
  }

  writeLap(values) {
    this.writeMesg('lap', values);
  }

  writeRecord(values) {
    this.writeMesg('record', values);
  }

  writeCourse(values) {
    this.writeMesg('course', values);
  }

  writeCoursePoint(values) {
    this.writeMesg('course_point', values);
  }

  writeEvent(values) {
    this.writeMesg('event', values);
  }


  writeMesg(mesgName, values) {
    let localNum = this.localNum[mesgName];
    if (localNum === undefined) {
      localNum = this.localNum[mesgName] = Object.keys(this.localNum).length;
    }

    const mesg = new Mesg(localNum, mesgName, values);

    const mesgDefn = this.mesgDefn[localNum];
    if (!mesgDefn || !mesg.isSameDefn(mesgDefn)) {
      this.messages.push(mesg.defnRecord);
      this.mesgDefn[localNum] = mesg.mesgDefn;
    }
    this.messages.push(mesg.dataRecord);
  }

  get blob() {
    const content = [this.header, ...this.messages, this.trailer];
    return new Blob(content, { type: 'application/octet-stream' });
  }

  get dataLen() {
    return this.messages.reduce((len, message) => len + message.byteLength, 0);
  }

  get dataCrc() {
    return this.messages.reduce((dataCrc, message) => crc(message, dataCrc), 0);
  }

  get header() {
    const dv = new DataView(new ArrayBuffer(HEADER_LEN));
    dv.setUint8(0, HEADER_LEN);
    dv.setUint8(1, PROTOCOL_VERSION);
    dv.setUint16(2, PROFILE_VERSION, true);
    dv.setUint32(4, this.dataLen, true);
    dv.setUint32(8, MAGIC);
    dv.setUint16(12, crc(dv.buffer.slice(0, 12)), true);

    return dv.buffer;
  }

  get trailer() {
    const dv = new DataView(new ArrayBuffer(2));
    dv.setUint16(0, this.dataCrc, true);

    return dv.buffer;
  }
}
