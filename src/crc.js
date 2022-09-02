// Adapted from fit-route project: 
// https://gitlab.com/nwholloway/fit-route/-/tree/8467d5baf7d8955f0e931074972796824d582ce2/public/js/fit/crc.js
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


const CRC_TABLE = [
  0x0000,
  0xcc01,
  0xd801,
  0x1400,
  0xf001,
  0x3c00,
  0x2800,
  0xe401,
  0xa001,
  0x6c00,
  0x7800,
  0xb401,
  0x5000,
  0x9c01,
  0x8801,
  0x4400
];

const update_nibble = (crc, nibble) => ((crc >> 4) & 0x0fff) ^ CRC_TABLE[crc & 0xf] ^ CRC_TABLE[nibble];
const update_nibbles = (crc, lo, hi) => update_nibble(update_nibble(crc, lo), hi);
const update = (crc, byte) => update_nibbles(crc, byte & 0xf, (byte >> 4) & 0xf);

export function crc(buffer, initial = 0) {
  return new Uint8Array(buffer).reduce((crc, byte) => update(crc, byte), initial);
}
