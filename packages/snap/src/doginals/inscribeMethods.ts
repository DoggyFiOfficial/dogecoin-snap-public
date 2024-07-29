/**
 * Methods for inscribing transactions...
 */

// An example of a correct transfer inscription
// {
//   "p": "drc-20",
//   "op": "transfer",
//   "tick": "woof",
//   "amt": "100"
// }

/**
 * Creates a transfer inscription and returns a JSON string as a hex string.
 *
 * @param p - The token type.
 * @param tick - The token symbol.
 * @param amt - The amount of tokens to transfer.
 * @returns A string that is the hex encoding of the transfer inscription.
 */
export function makeTransferInscription(
  p: string,
  tick: string,
  amt: string,
): string {
  const json = JSON.stringify({
    p,
    op: 'transfer',
    tick: tick.toLowerCase(),
    amt: String(amt),
  });
  return Buffer.from(json).toString('hex');
}

// An example of a correct mint inscription
// {
//     "p": "drc-20",
//     "op": "mint",
//     "tick": "woof",
//     "amt": "1000"
// }
/**
 * Make a hex string for a DRC-20 token mint inscription.
 *
 * @param p - The standard for the token (e.g., drc-20).
 * @param tick - The token symbol.
 * @param amt - The amount of tokens to mint.
 * @returns The hex string encoding of a mint inscription for a DRC-20 token.
 */
export function makeMintInscription(
  p: string,
  tick: string,
  amt: string,
): string {
  const json = JSON.stringify({
    p,
    op: 'mint',
    tick: tick.toLowerCase(),
    amt: String(amt),
  });
  return Buffer.from(json).toString('hex');
}

// An example of a correct transfer inscription
// {
//     "p": "drc-20",
//     "op": "deploy",
//     "tick": "woof",
//     "max": "21000000",
//     "lim": "1000"
//     "dec": "18"
// }
// Note lim, and dec are optional...
/**
 * Make a hex string for deploy inscription following the DRC-20 token standard.
 *
 * @param p - The standard for the token (e.g., drc-20).
 * @param tick - The token symbol.
 * @param max - The max amount of tokens to mint.
 * @param lim - The limit of the mint.
 * @param dec - The decimal places.
 * @returns The hex string encoding of a deploy inscription following DRC-20 token standard.
 */
export function makeDeployInscription(
  p: string,
  tick: string,
  max: string,
  lim: string | null | undefined,
  dec: string | null | undefined,
): string {
  // If lim or dec are not provided, don't include them in the JSON
  let json;
  if (lim && dec) {
    json = JSON.stringify({
      p,
      op: 'deploy',
      tick: tick.toLowerCase(),
      max: String(max),
      lim: String(lim),
      dec: String(dec),
    });
  } else if (lim) {
    json = JSON.stringify({
      p,
      op: 'deploy',
      tick: tick.toLowerCase(),
      max: String(max),
      lim: String(lim),
    });
  } else if (dec) {
    json = JSON.stringify({
      p,
      op: 'deploy',
      tick: tick.toLowerCase(),
      max: String(max),
      dec: String(dec),
    });
  } else {
    json = JSON.stringify({
      p,
      op: 'deploy',
      tick: tick.toLowerCase(),
      max: String(max),
    });
  }
  return Buffer.from(json).toString('hex');
}
