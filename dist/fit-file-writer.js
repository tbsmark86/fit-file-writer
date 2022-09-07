(() => {
  // src/types.js
  var enum_maps = {
    file: { course: 6 },
    sport: { cycling: 2 },
    event: { timer: 0 },
    event_type: { start: 0, stop_disable_all: 9 },
    course_point: {
      generic: 0,
      summit: 1,
      valley: 2,
      water: 3,
      food: 4,
      danger: 5,
      left: 6,
      right: 7,
      straight: 8,
      first_aid: 9,
      fourth_category: 10,
      third_category: 11,
      second_category: 12,
      first_category: 13,
      hors_category: 14,
      sprint: 15,
      left_fork: 16,
      right_fork: 17,
      middle_fork: 18,
      slight_left: 19,
      sharp_left: 20,
      slight_right: 21,
      sharp_right: 22,
      u_turn: 23,
      segment_start: 24,
      segment_end: 25
    }
  };
  var _enum = (name) => {
    const enum_map = enum_maps[name];
    return {
      size: 1,
      baseType: 0,
      mapValue: (value) => enum_map[value],
      setValue: DataView.prototype.setUint8
    };
  };
  var enum_file = _enum("file");
  var enum_sport = _enum("sport");
  var enum_event = _enum("event");
  var enum_event_type = _enum("event_type");
  var enum_course_point = _enum("course_point");
  var sint8 = {
    size: 1,
    baseType: 1,
    setValue: DataView.prototype.setInt8
  };
  var uint8 = {
    size: 1,
    baseType: 2,
    setValue: DataView.prototype.setUint8
  };
  var sint16 = {
    size: 2,
    baseType: 131,
    setValue: DataView.prototype.setInt16
  };
  var uint16 = {
    size: 2,
    baseType: 132,
    setValue: DataView.prototype.setUint16
  };
  var sint32 = {
    size: 4,
    baseType: 133,
    setValue: DataView.prototype.setInt32
  };
  var uint32 = {
    size: 4,
    baseType: 134,
    setValue: DataView.prototype.setUint32
  };
  var string = {
    size: 0,
    baseType: 7,
    mapValue: (value) => Array.from(encodedStr(value)),
    setValue: dvSetUint8Array
  };
  var seconds = {
    ...uint32,
    mapValue: (value) => Math.round(value * 1e3)
  };
  var distance = {
    ...uint32,
    mapValue: (value) => Math.round(value * 100)
  };
  var altitude = {
    ...uint16,
    mapValue: (value) => Math.round((value + 500) * 5)
  };
  var date_time = {
    ...uint32,
    mapValue: (value) => Math.round(value / 1e3) - 631065600
  };
  var semicircles = {
    ...sint32,
    mapValue: (value) => Math.round(value / 180 * 2147483648)
  };
  var types = {
    enum_file,
    enum_sport,
    enum_event,
    enum_event_type,
    enum_course_point,
    sint8,
    uint8,
    sint16,
    uint16,
    sint32,
    uint32,
    string,
    seconds,
    distance,
    semicircles,
    altitude,
    date_time
  };
  function encodedStrlen(str) {
    return Array.from(encodedStr(str)).length;
  }
  function* encodedStr(s) {
    for (const codePoint of codePoints(s)) {
      if (codePoint < 128) {
        yield codePoint;
      } else {
        const bytes = [codePoint & 63, codePoint >> 6 & 63, codePoint >> 12 & 63, codePoint >> 18];
        if (codePoint < 2048) {
          yield 192 | bytes[1];
          yield 128 | bytes[0];
        } else if (codePoint < 65536) {
          yield 224 | bytes[2];
          yield 128 | bytes[1];
          yield 128 | bytes[0];
        } else {
          yield 240 | bytes[3];
          yield 128 | bytes[2];
          yield 128 | bytes[1];
          yield 128 | bytes[0];
        }
      }
    }
    yield 0;
  }
  function* codePoints(s) {
    for (let i = 0; i < s.length; i++) {
      const codePoint = s.codePointAt(i);
      if (codePoint > 65535) {
        i++;
      }
      yield codePoint;
    }
  }
  function dvSetUint8Array(offset, values) {
    const dv = this;
    for (const value of values) {
      dv.setUint8(offset++, value);
    }
  }

  // src/mesg.js
  var mesgDefns = {
    file_id: {
      mesgNum: 0,
      fieldDefns: [
        { name: "type", number: 0, type: "enum_file" },
        { name: "time_created", number: 4, type: "date_time" }
      ]
    },
    lap: {
      mesgNum: 19,
      fieldDefns: [
        { name: "timestamp", number: 253, type: "date_time" },
        { name: "start_time", number: 2, type: "date_time" },
        { name: "start_position_lat", number: 3, type: "semicircles" },
        { name: "start_position_long", number: 4, type: "semicircles" },
        { name: "end_position_lat", number: 5, type: "semicircles" },
        { name: "end_position_long", number: 6, type: "semicircles" },
        { name: "total_timer_time", number: 8, type: "seconds" },
        { name: "total_distance", number: 9, type: "distance" },
        { name: "total_ascent", number: 21, type: "uint16" },
        { name: "total_descent", number: 22, type: "uint16" }
      ]
    },
    record: {
      mesgNum: 20,
      fieldDefns: [
        { name: "timestamp", number: 253, type: "date_time" },
        { name: "position_lat", number: 0, type: "semicircles" },
        { name: "position_long", number: 1, type: "semicircles" },
        { name: "altitude", number: 2, type: "altitude" },
        { name: "distance", number: 5, type: "distance" }
      ]
    },
    course_point: {
      mesgNum: 32,
      fieldDefns: [
        { name: "message_index", number: 0, type: "uint16" },
        { name: "timestamp", number: 1, type: "date_time" },
        { name: "position_lat", number: 2, type: "semicircles" },
        { name: "position_long", number: 3, type: "semicircles" },
        { name: "distance", number: 4, type: "distance" },
        { name: "type", number: 5, type: "enum_course_point" },
        { name: "name", number: 6, type: "string" },
        { name: "favorite", number: 8, type: "string" }
      ]
    },
    event: {
      mesgNum: 21,
      fieldDefns: [
        { name: "timestamp", number: 253, type: "date_time" },
        { name: "event", number: 0, type: "enum_event" },
        { name: "event_type", number: 1, type: "enum_event_type" },
        { name: "event_group", number: 4, type: "uint8" }
      ]
    },
    course: {
      mesgNum: 31,
      fieldDefns: [{ name: "name", number: 5, type: "string" }]
    }
  };
  var fields = (fieldDefns, fieldValues) => {
    return fieldDefns.map((fieldDefn) => ({ ...fieldDefn, value: fieldValues[fieldDefn.name] })).filter(({ value }) => value !== void 0);
  };
  var Mesg = class {
    static check(mesgName, mesgNum, fieldDefns, values) {
      if (mesgNum === void 0) {
        throw new Error(`Message '${mesgName}' not known`);
      }
      if (fieldDefns === void 0) {
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
        if (type === "string") {
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
      const isSameFieldDefn = (defn1, defn2) => defn1.number === defn2.number && defn1.size === defn2.size && defn1.baseType === defn2.baseType;
      const areSameFieldDefns = (defns1, defns2) => defns1.length === defns2.length && defns1.every((defn1, i) => isSameFieldDefn(defn1, defns2[i]));
      const { localNum, mesgNum, fieldDefns } = this.mesgDefn;
      return mesgNum === mesgDefn.mesgNum && localNum === mesgDefn.localNum && areSameFieldDefns(fieldDefns, mesgDefn.fieldDefns);
    }
    get defnRecord() {
      const { localNum, mesgNum, fieldDefns } = this.mesgDefn;
      const recordLen = 6 + 3 * fieldDefns.length;
      const dv = new DataView(new ArrayBuffer(recordLen));
      dv.setUint8(0, 64 | localNum);
      dv.setUint8(2, 1);
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
  };

  // src/crc.js
  var CRC_TABLE = [
    0,
    52225,
    55297,
    5120,
    61441,
    15360,
    10240,
    58369,
    40961,
    27648,
    30720,
    46081,
    20480,
    39937,
    34817,
    17408
  ];
  var update_nibble = (crc2, nibble) => crc2 >> 4 & 4095 ^ CRC_TABLE[crc2 & 15] ^ CRC_TABLE[nibble];
  var update_nibbles = (crc2, lo, hi) => update_nibble(update_nibble(crc2, lo), hi);
  var update = (crc2, byte) => update_nibbles(crc2, byte & 15, byte >> 4 & 15);
  function crc(buffer, initial = 0) {
    return new Uint8Array(buffer).reduce((crc2, byte) => update(crc2, byte), initial);
  }

  // src/encoder.js
  var HEADER_LEN = 14;
  var PROTOCOL_VERSION = 16;
  var PROFILE_VERSION = 2078;
  var MAGIC = 776358228;
  var FITEncoder = class {
    constructor() {
      this.localNum = {};
      this.mesgDefn = [];
      this.messages = [];
    }
    writeFileId(values) {
      this.writeMesg("file_id", values);
    }
    writeLap(values) {
      this.writeMesg("lap", values);
    }
    writeRecord(values) {
      this.writeMesg("record", values);
    }
    writeCourse(values) {
      this.writeMesg("course", values);
    }
    writeCoursePoint(values) {
      this.writeMesg("course_point", values);
    }
    writeEvent(values) {
      this.writeMesg("event", values);
    }
    writeMesg(mesgName, values) {
      let localNum = this.localNum[mesgName];
      if (localNum === void 0) {
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
      return new Blob(content, { type: "application/octet-stream" });
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
  };

  // src/course.js
  var FITCourseFile = class {
    constructor(name, start_time, total_timer_time, start, end) {
      this.encoder = new FITEncoder();
      const now = Date.now();
      this.encoder.writeFileId({ type: "course", time_created: now });
      this.encoder.writeCourse({ name });
      this.encoder.writeLap({
        timestamp: now,
        start_time,
        total_timer_time,
        start_position_long: start[0],
        start_position_lat: start[1],
        end_position_long: end[0],
        end_position_lat: end[1]
      });
    }
    point(time, pos, altitude2, distance2) {
      this.encoder.writeRecord({
        timestamp: time,
        position_long: pos[0],
        position_lat: pos[1],
        altitude: altitude2,
        distance: distance2
      });
      return this;
    }
    turn(time, pos, type, name, distance2) {
      this.encoder.writeCoursePoint({
        timestamp: time,
        position_long: pos[0],
        position_lat: pos[1],
        type,
        name,
        distance: distance2
      });
      return this;
    }
    finalize(time) {
      this.encoder.writeEvent({
        timestamp: time,
        event: "timer",
        event_type: "stop_disable_all",
        event_group: 0
      });
      return this.encoder.blob;
    }
  };

  // src/build.js
  window.FITEncoder = FITEncoder;
  window.FITCourseFile = FITCourseFile;
})();
