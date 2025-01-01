// javascript module to make a dune tx to open a dune
const { Etching, Terms, SpacedDune, Flag } = require('./dunesClasses');
const { constructScript } = require('./constructScript');
const { Transaction } = require('bitcore-lib-doge');
const { fund } = require('./fund');
const { constants } = require('./constants');

function minimumAtHeight(height) {
  const offset = BigInt(height) + BigInt(1);

  const INTERVAL = constants.SUBSIDY_HALVING_INTERVAL_10X / BigInt(12);

  const start = constants.FIRST_DUNE_HEIGHT;
  const end = start + constants.SUBSIDY_HALVING_INTERVAL_10X;

  if (offset < start) {
    return BigInt(STEPS[12]);
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

function isSingleEmoji(str) {
  const emojiRegex = /[\p{Emoji}]/gu; // eslint-disable-line

  const matches = str.match(emojiRegex);

  return matches ? matches.length === 1 : false;
}

// Function to parse a string into a SpacedDune in Node.js
function spacedDunefromStr(s) {
  let dune = '';
  let spacers = 0;

  for (const c of s) {
    switch (true) {
      case /[A-Z]/.test(c):
        dune += c;
        break;
      case /[.•]/.test(c):
        const flag = 1 << (dune.length - 1);
        if ((spacers & flag) !== 0) {
          throw new Error('double spacer');
        }
        spacers |= flag;
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

export async function _getOpenDuneTx(
  wallet,
  currentBlockHeight,
  dunesBalances,
  tick,
  symbol,
  limit,
  divisibility,
  cap,
  heightStart,
  heightEnd,
  offsetStart,
  offsetEnd,
  premine,
  turbo,
  openMint,
  doggyfiFee,
  doggyfiAddress,
) {
  cap = cap === 'null' ? null : cap;
  heightStart = heightStart === 'null' ? null : heightStart;
  heightEnd = heightEnd === 'null' ? null : heightEnd;
  offsetStart = offsetStart === 'null' ? null : offsetStart;
  offsetEnd = offsetEnd === 'null' ? null : offsetEnd;
  premine = premine === 'null' ? null : premine;
  turbo = turbo === 'null' ? null : turbo === 'true';

  openMint = openMint.toLowerCase() === 'true';

  if (symbol) {
    if (symbol.length !== 1 && !isSingleEmoji(symbol)) {
      console.error(
        `Error: The argument symbol should have exactly 1 character, but is '${symbol}'`,
      );
      process.exit(1);
    }
  }

  const spacedDune = spacedDunefromStr(tick);

  const mininumAtCurrentHeight = minimumAtHeight(currentBlockHeight);

  if (spacedDune.dune.value < mininumAtCurrentHeight) {
    const minAtCurrentHeightObj = { _value: mininumAtCurrentHeight };
    format.call(minAtCurrentHeightObj, formatter);
    console.error('Dune characters are invalid at current height.');
    process.stdout.write(
      `minimum at current height: ${mininumAtCurrentHeight} possible lowest tick: ${formatter.output}\n`,
    );
    console.log(`dune: ${tick} value: ${spacedDune.dune.value}`);
    process.exit(1);
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
  let balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0);
  if (balance == 0) throw new Error('no funds');

  // creating new tx
  let tx = new Transaction();

  // first output carries the protocol message
  tx.addOutput(new Transaction.Output({ script: script, satoshis: 0 }));

  
  // Create second output to sender if dunes are directly allocated in etching
  if (premine > 0) tx.to(wallet.address, 100_000);
  
  // finally add doggyfi fee
  tx.to(doggyfiAddress, doggyfiFee);

  await fund(wallet, tx, dunesBalances, true);
  let _tx = tx.uncheckedSerialize();
  let _fees = tx.inputAmount - tx.outputAmount;

  // return tx that would be broadcast, along with it's total fees
  return {
    tx: _tx,
    fees: _fees,
  };
}
