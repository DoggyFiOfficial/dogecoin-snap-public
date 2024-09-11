// sir-duney's varIntEncode javascript function
// Encode a u128 value to a byte array
export function varIntEncode(n) {
  const out = new Array(19).fill(0);
  let i = 18;

  out[i] = Number(BigInt(n) & 0b01111111n);

  while (BigInt(n) > 0b01111111n) {
    n = BigInt(n) / 128n - 1n;
    i -= 1;
    out[i] = Number(BigInt(n) | 0b10000000n);
  }

  return out.slice(i);
}
