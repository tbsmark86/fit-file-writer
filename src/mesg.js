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

import { types, encodedStrlen } from './types.js';

const mesgDefns = {
  file_id: {
    mesgNum: 0,
    fieldDefns: [
      { name: 'type', number: 0, type: 'enum_file' },
      { name: 'time_created', number: 4, type: 'date_time' }
    ]
  },
  lap: {
    mesgNum: 19,
    fieldDefns: [
      { name: 'timestamp', number: 253, type: 'date_time' },
      { name: 'start_time', number: 2, type: 'date_time' },
      { name: 'start_position_lat', number: 3, type: 'semicircles' },
      { name: 'start_position_long', number: 4, type: 'semicircles' },
      { name: 'end_position_lat', number: 5, type: 'semicircles' },
      { name: 'end_position_long', number: 6, type: 'semicircles' },
      { name: 'total_timer_time', number: 8, type: 'seconds' },
      { name: 'total_distance', number: 9, type: 'distance' },
      { name: 'total_ascent', number: 21, type: 'uint16' },
      { name: 'total_descent', number: 22, type: 'uint16' }
    ]
  },
  record: {
    mesgNum: 20,
    fieldDefns: [
      { name: 'timestamp', number: 253, type: 'date_time' },
      { name: 'position_lat', number: 0, type: 'semicircles' },
      { name: 'position_long', number: 1, type: 'semicircles' },
      { name: 'altitude', number: 2, type: 'altitude' },
      { name: 'distance', number: 5, type: 'distance' }
    ]
  },
  course_point: {
    mesgNum: 32,
    fieldDefns: [
      { name: 'message_index', number: 0, type: 'uint16' },
      { name: 'timestamp', number: 1, type: 'date_time' },
      { name: 'position_lat', number: 2, type: 'semicircles' },
      { name: 'position_long', number: 3, type: 'semicircles' },
      { name: 'distance', number: 4, type: 'distance' },
      { name: 'type', number: 5, type: 'enum_course_point' },
      { name: 'name', number: 6, type: 'string' }
    ]
  },
  event: {
    mesgNum: 21,
    fieldDefns: [
      { name: 'timestamp', number: 253, type: 'date_time' },
      { name: 'event', number: 0, type: 'enum_event' },
      { name: 'event_type', number: 1, type: 'enum_event_type' },
      { name: 'event_group', number: 4, type: 'uint8' }
    ]
  },
  course: {
    mesgNum: 31,
    fieldDefns: [{ name: 'name', number: 5, type: 'string' }]
  }
};

const fields = (fieldDefns, fieldValues) => {
  return fieldDefns
    .map((fieldDefn) => ({ ...fieldDefn, value: fieldValues[fieldDefn.name] }))
    .filter(({ value }) => value !== undefined);
};

export class Mesg {
  static check(mesgName, mesgNum, fieldDefns, values) {
    if (mesgNum === undefined) {
      throw new Error(`Message '${mesgName}' not known`);
    }
    if (fieldDefns === undefined) {
      throw new Error(`Message '${mesgName}' has no field definitions`);
    }
    const fieldNames = fieldDefns.map((fieldDefn) => fieldDefn.name);
    const unknownFields = Object.keys(values).filter((fieldName) => !fieldNames.includes(fieldName));
    if (unknownFields.length) {
      throw new Error(`Message '${mesgName}' has no field definitions named '${unknownFields}'`);
    }
  }

  constructor(localNum, mesgName, values) {
    const { mesgNum, fieldDefns } = mesgDefns[mesgName];
    Mesg.check(mesgName, mesgNum, fieldDefns, values);
    this.localNum = localNum;
    this.mesgNum = mesgNum;
    this.fields = fields(fieldDefns, values);
  }

  get mesgDefn() {
    const fieldDefns = this.fields.map(({ number, type, value }) => {
      const { size, baseType } = types[type];
      if (type === 'string') {
        return { number, size: encodedStrlen(value), baseType };
      }
      return { number, size, baseType };
    });
    return {
      localNum: this.localNum,
      mesgNum: this.mesgNum,
      fieldDefns
    };
  }

  isSameDefn(mesgDefn) {
    const isSameFieldDefn = (defn1, defn2) =>
      defn1.number === defn2.number && defn1.size === defn2.size && defn1.baseType === defn2.baseType;
    const areSameFieldDefns = (defns1, defns2) =>
      defns1.length === defns2.length && defns1.every((defn1, i) => isSameFieldDefn(defn1, defns2[i]));

    const { localNum, mesgNum, fieldDefns } = this.mesgDefn;
    return (
      mesgNum === mesgDefn.mesgNum &&
      localNum === mesgDefn.localNum &&
      areSameFieldDefns(fieldDefns, mesgDefn.fieldDefns)
    );
  }

  get defnRecord() {
    const { localNum, mesgNum, fieldDefns } = this.mesgDefn;
    const recordLen = 6 + 3 * fieldDefns.length;
    const dv = new DataView(new ArrayBuffer(recordLen));

    dv.setUint8(0, 0x40 | localNum);
    dv.setUint8(2, 1); // big endian
    dv.setUint16(3, mesgNum);
    dv.setUint8(5, fieldDefns.length);

    let offset = 6;
    for (const fieldDefn of fieldDefns) {
      dv.setUint8(offset++, fieldDefn.number);
      dv.setUint8(offset++, fieldDefn.size);
      dv.setUint8(offset++, fieldDefn.baseType);
    }

    return dv.buffer;
  }

  get dataRecord() {
    const { localNum, fieldDefns } = this.mesgDefn;
    const recordLen = 1 + fieldDefns.reduce((len, { size }) => len + size, 0);
    const dv = new DataView(new ArrayBuffer(recordLen));

    dv.setUint8(0, localNum);
    let offset = 1;
    for (const { value, type } of this.fields) {
      const { size, mapValue, setValue } = types[type];
      setValue.call(dv, offset, mapValue ? mapValue(value) : value);
      offset += size;
    }

    return dv.buffer;
  }
}
