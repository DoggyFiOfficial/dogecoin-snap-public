//JS classes from sirduney implementation
const { varIntEncode } = require('./varIntEncode');
export class Etching {
  // Constructor for Etching
  constructor(divisibility, terms, turbo, premine, dune, spacers, symbol) {
    this.divisibility = divisibility;
    this.terms = terms !== undefined ? terms : null;
    this.turbo = turbo !== undefined ? turbo : null;
    this.premine = premine !== undefined ? premine : null;
    this.dune = dune;
    this.spacers = spacers;
    this.symbol = symbol;
  }
}
export class Flag {
  static Etch = 0;
  static Terms = 1;
  static Turbo = 2;
  static Cenotaph = 127;

  static mask(flag) {
    return BigInt(1) << BigInt(flag);
  }

  static take(flag, flags) {
    const mask = Flag.mask(flag);
    const set = (flags & mask) !== 0n;
    flags &= ~mask;
    return set;
  }

  static set(flag, flags) {
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
  static Body = 0;
  static Flags = 2;
  static Dune = 4;
  static Limit = 6;
  static OffsetEnd = 8;
  static Deadline = 10;
  static Pointer = 12;
  static HeightStart = 14;
  static OffsetStart = 16;
  static HeightEnd = 18;
  static Cap = 20;
  static Premine = 22;

  static Cenotaph = 254;

  static Divisibility = 1;
  static Spacers = 3;
  static Symbol = 5;
  static Nop = 255;

  static take(tag, fields) {
    return fields[tag];
  }

  static encode(tag, value, payload) {
    payload.push(varIntEncode(tag));
    if (tag == Tag.Dune) payload.push(encodeToTuple(value));
    else payload.push(varIntEncode(value));
  }
}
export class Terms {
  constructor(limit, cap, offsetStart, offsetEnd, heightStart, heightEnd) {
    this.limit = limit !== undefined ? limit : null;
    this.cap = cap !== undefined ? cap : null;
    this.offsetStart = offsetStart !== undefined ? offsetStart : null;
    this.offsetEnd = offsetEnd !== undefined ? offsetEnd : null;
    this.heightStart = heightStart !== undefined ? heightStart : null;
    this.heightEnd = heightEnd !== undefined ? heightEnd : null;
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
