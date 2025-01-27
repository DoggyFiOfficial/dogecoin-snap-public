/**
 * Based on Sir-Duney's implemenation, encodes a BigInt into a custom multi-byte
 * format where each byte stores 7 bits. The highest bit of each byte (0x80) is
 * used as a "continuation" flag.
 *
 * Unlike standard varint or LEB128 encoding, this function subtracts 1 from the
 * value after dividing by 128 on each iteration (n = n / 128 - 1). As a result,
 * it will not produce the usual varint/LEB128 representation and is incompatible
 * with typical varint decoders.
 *
 * The final encoding is returned as an array of bytes (numbers), with the first
 * byte of the encoding at index 0 of the returned array. The maximum array
 * length is 19 bytes, though in practice it will be shorter for most numbers.
 *
 * @param {bigint} _n - The BigInt to be encoded.
 * @returns {number[]} An array of bytes representing the custom encoded value.
 */
export function varIntEncode(_n) {
  const out = new Array(19).fill(0);
  let i = 18;

  // eslint-disable-next-line no-bitwise
  out[i] = Number(BigInt(_n) & BigInt('0b01111111'));

  let n = _n;
  while (BigInt(n) > BigInt('0b01111111')) {
    n = BigInt(n) / BigInt(128) - BigInt(1);
    i -= 1;
    // eslint-disable-next-line no-bitwise
    out[i] = Number(BigInt(n) | BigInt('0b10000000'));
  }

  return out.slice(i);
}
