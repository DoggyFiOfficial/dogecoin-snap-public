// JS classes from sirduney implementation
import { varIntEncode } from './varIntEncode';

export class Etching {
  // Constructor for Etching
  constructor(divisibility, terms, turbo, premine, dune, spacers, symbol) {
    this.divisibility = divisibility;
    this.terms = terms === undefined ? null : terms;
    this.turbo = turbo === undefined ? null : turbo;
    this.premine = premine === undefined ? null : premine;
    this.dune = dune;
    this.spacers = spacers;
    this.symbol = symbol;
  }
}

export class Flag {
  static get Etch() {
    return 0;
  }

  static get Terms() {
    return 1;
  }

  static get Turbo() {
    return 2;
  }

  static get Cenotaph() {
    return 127;
  }

  static mask(flag) {
    // eslint-disable-next-line no-bitwise
    return BigInt(1) << BigInt(flag);
  }

  static take(flag, flags) {
    const mask = Flag.mask(flag);
    // eslint-disable-next-line no-bitwise
    const set = (flags & mask) !== BigInt(0);
    // eslint-disable-next-line no-bitwise
    flags &= ~mask; // eslint-disable-line no-param-reassign
    return set;
  }

  static set(flag, flags) {
    /* eslint-disable no-bitwise */
    /* eslint-disable no-param-reassign */
    /* eslint-disable no-unused-vars */
    flags |= Flag.mask(flag);
  }
}
export class PushBytes {
  constructor(bytes) {
    this.bytes = Buffer.from(bytes);
  }

  static fromSliceUnchecked(bytes) {
    return new PushBytes(bytes);
  }

  static fromMutSliceUnchecked(bytes) {
    return new PushBytes(bytes);
  }

  static empty() {
    return new PushBytes([]);
  }

  asBytes() {
    return this.bytes;
  }

  asMutBytes() {
    return this.bytes;
  }
}

export class Tag {
  static get Body() {
    return 0;
  }

  static get Flags() {
    return 2;
  }

  static get Dune() {
    return 4;
  }

  static get Limit() {
    return 6;
  }

  static get OffsetEnd() {
    return 8;
  }

  static get Deadline() {
    return 10;
  }

  static get Pointer() {
    return 12;
  }

  static get HeightStart() {
    return 14;
  }

  static get OffsetStart() {
    return 16;
  }

  static get HeightEnd() {
    return 18;
  }

  static get Cap() {
    return 20;
  }

  static get Premine() {
    return 22;
  }

  static get Cenotaph() {
    return 254;
  }

  static get Divisibility() {
    return 1;
  }

  static get Spacers() {
    return 3;
  }

  static get Symbol() {
    return 5;
  }

  static get Nop() {
    return 255;
  }

  static take(tag, fields) {
    return fields[tag];
  }

  static encode(tag, value, payload) {
    payload.push(varIntEncode(tag));
    if (tag === Tag.Dune) {
      payload.push(encodeToTuple(value));
    } else {
      payload.push(varIntEncode(value));
    }
  }
}
export class Terms {
  constructor(limit, cap, offsetStart, offsetEnd, heightStart, heightEnd) {
    this.limit = limit === undefined ? null : limit;
    this.cap = cap === undefined ? null : cap;
    this.offsetStart = offsetStart === undefined ? null : offsetStart;
    this.offsetEnd = offsetEnd === undefined ? null : offsetEnd;
    this.heightStart = heightStart === undefined ? null : heightStart;
    this.heightEnd = heightEnd === undefined ? null : heightEnd;
  }
}
class Dune {
  constructor(value) {
    this.value = BigInt(value);
  }
}
export class SpacedDune {
  constructor(dune, spacers) {
    this.dune = parseDuneFromString(dune);
    this.spacers = spacers;
  }
}

/**
 * Parses a string into a SpacedDune object.
 *
 * @param {*} s - String to be parsed.
 * @returns {Dune} A SpacedDune object.
 */
function parseDuneFromString(s) {
  let x = BigInt(0);

  for (let i = 0; i < s.length; i++) {
    if (i > 0) {
      x += BigInt(1);
    }

    x *= BigInt(26);

    const charCode = s.charCodeAt(i);

    if (charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0)) {
      x += BigInt(charCode - 'A'.charCodeAt(0));
    } else {
      throw new Error(`Invalid character in dune name: ${s[i]}`);
    }
  }

  return new Dune(x);
}

/**
 * Encodes a number to a tuple representation.
 *
 * @param {bigint} n - The number to encode.
 * @returns {number[]} The tuple representation of the number.
 */
function encodeToTuple(n) {
  const tupleRepresentation = [];

  tupleRepresentation.push(Number(n & BigInt(0b0111_1111)));

  while (n > BigInt(0b0111_1111)) {
    n = n / BigInt(128) - BigInt(1);
    tupleRepresentation.unshift(
      Number((n & BigInt(0b0111_1111)) | BigInt(0b1000_0000)),
    );
  }

  return tupleRepresentation;
}
