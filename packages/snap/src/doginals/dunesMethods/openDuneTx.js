// javascript module to make a dune tx to open a dune
import dogecore from 'bitcore-lib-doge';
import { z } from 'zod'; // eslint-disable-line import/namespace
import { Etching, Terms, SpacedDune } from './dunesClasses';
import { constructScript } from './constructScript';
import { fund } from './fund';
import { constants } from './constants';

const { Transaction } = dogecore;

/**
 * Function to calculate the minimum dune value at a given height.
 *
 * @param {*} height - The height to calculate the minimum dune value at.
 * @returns {bigint} The minimum dune value at the given height.
 */
function minimumAtHeight(height) {
  const offset = BigInt(height) + BigInt(1);

  const INTERVAL = constants.SUBSIDY_HALVING_INTERVAL_10X / BigInt(12);

  const start = constants.FIRST_DUNE_HEIGHT;
  const end = start + constants.SUBSIDY_HALVING_INTERVAL_10X;

  if (offset < start) {
    return BigInt(constants.STEPS[12]);
  }

  if (offset >= end) {
    return BigInt(0);
  }

  const progress = offset - start;

  const length = BigInt(12 - Math.floor(Number(progress / INTERVAL)));

  const endValue = BigInt(constants.STEPS[length - BigInt(1)]);
  const startValue = BigInt(constants.STEPS[length]);

  const remainder = progress % INTERVAL;

  return startValue - ((startValue - endValue) * remainder) / INTERVAL;
}

/**
 * Checks if a string is a single emoji.
 *
 * @param {*} s - The string to check.
 * @returns {boolean} True if the string is a single emoji, false otherwise.
 */
function isSingleEmoji(s) {
  const joiner = '\ud83c';
  const separated = s.split('');
  if (separated.length === 4 && !separated.includes(joiner)) {
    return false;
  }
  return z.string().min(1).max(4).emoji().safeParse(s).success;
}

/**
 * Function to parse a string into a SpacedDune in Node.js.
 *
 * @param {*} s - The string to parse.
 * @returns {SpacedDune} The parsed SpacedDune.
 */
function spacedDunefromStr(s) {
  let dune = '';
  let spacers = 0;

  for (const c of s) {
    switch (true) {
      case /[A-Z]/.test(c): // eslint-disable-line require-unicode-regexp
        dune += c;
        break;
      case /[.•]/.test(c): // eslint-disable-line require-unicode-regexp
        // eslint-disable-next-line no-case-declarations
        const flag = 1 << (dune.length - 1); // eslint-disable-line no-bitwise
        // eslint-disable-next-line no-bitwise
        if ((spacers & flag) !== 0) {
          throw new Error('double spacer');
        }
        spacers |= flag; // eslint-disable-line no-bitwise
        break;
      default:
        throw new Error('invalid character');
    }
  }

  if (32 - Math.clz32(spacers) >= dune.length) {
    throw new Error('trailing spacer');
  }

  return new SpacedDune(dune, spacers);
}

/**
 * The function to make a dune tx to open a dune.
 *
 * @param {*} wallet - An Apezord wallet.
 * @param {*} currentBlockHeight - The current block height.
 * @param {*} dunesBalances - The dunes balances of the wallet.
 * @param {*} tick - The tick of the dune to open.
 * @param {*} symbol - The symbol of the dune to open.
 * @param {*} limit - The limit of the dune to open.
 * @param {*} divisibility - The divisibility of the dune to open.
 * @param {*} _cap - The cap of the dune to open.
 * @param {*} _heightStart - The start height of the dune to open.
 * @param {*} _heightEnd - The end height of the dune to open.
 * @param {*} _offsetStart - The start offset of the dune to open.
 * @param {*} _offsetEnd - The end offset of the dune to open.
 * @param {*} _premine - The premine of the dune to open.
 * @param {*} _turbo - The turbo of the dune to open.
 * @param {*} _openMint - The open mint of the dune to open.
 * @param {*} doggyfiFee - The doggyfi fee.
 * @param {*} doggyfiAddress - The doggyfi address.
 * @returns {{tx: any; fees: number;}} Dogecoin transaction and fees.
 */
export async function _getOpenDuneTx(
  wallet,
  currentBlockHeight,
  dunesBalances,
  tick,
  symbol,
  limit,
  divisibility,
  _cap,
  _heightStart,
  _heightEnd,
  _offsetStart,
  _offsetEnd,
  _premine,
  _turbo,
  _openMint,
  doggyfiFee,
  doggyfiAddress,
) {
  const cap = _cap === 'null' ? null : _cap;
  const heightStart = _heightStart === 'null' ? null : _heightStart;
  const heightEnd = _heightEnd === 'null' ? null : _heightEnd;
  const offsetStart = _offsetStart === 'null' ? null : _offsetStart;
  const offsetEnd = _offsetEnd === 'null' ? null : _offsetEnd;
  const premine = _premine === 'null' ? null : _premine;
  const turbo = _turbo === 'null' ? null : _turbo === 'true';

  const openMint = _openMint.toLowerCase() === 'true';

  if (symbol) {
    if (symbol.length !== 1 && !isSingleEmoji(symbol)) {
      throw new Error(
        `Error: The argument symbol should have exactly 1 character, but is '${symbol}'`,
      );
    }
  }

  const spacedDune = spacedDunefromStr(tick);

  const mininumAtCurrentHeight = minimumAtHeight(currentBlockHeight);

  if (spacedDune.dune.value < mininumAtCurrentHeight) {
    const errorMessage = `Dune characters are invalid at current height. 
    Minimum at current height: ${mininumAtCurrentHeight}
    Possible lowest tick: ${mininumAtCurrentHeight.toFixed(2)}
    Dune: ${tick} value: ${spacedDune.dune.value}`;

    throw new Error(errorMessage);
  }

  const terms = openMint
    ? new Terms(limit, cap, offsetStart, offsetEnd, heightStart, heightEnd)
    : null;

  const etching = new Etching(
    divisibility,
    terms,
    turbo,
    premine,
    spacedDune.dune.value,
    spacedDune.spacers,
    symbol.codePointAt(),
  );

  // create script for given dune statements
  const script = constructScript(etching, undefined, null, null);

  // getting the wallet balance
  const balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0);
  if (balance === 0) {
    throw new Error('no funds');
  }

  // creating new tx
  const tx = new Transaction();

  // first output carries the protocol message
  tx.addOutput(new Transaction.Output({ script, satoshis: 0 }));

  // Create second output to sender if dunes are directly allocated in etching
  if (premine > 0) {
    tx.to(wallet.address, 100000);
  }

  // finally add doggyfi fee
  tx.to(doggyfiAddress, doggyfiFee);

  fund(wallet, tx, dunesBalances, true);
  const _tx = tx.uncheckedSerialize();
  const _fees = tx.inputAmount - tx.outputAmount;

  // return tx that would be broadcast, along with it's total fees
  return {
    tx: _tx,
    fees: _fees,
  };
}
