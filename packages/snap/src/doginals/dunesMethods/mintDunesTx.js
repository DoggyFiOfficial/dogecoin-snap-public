//sir-duney method for minting dunes
const { Edict } = require('./edict');
const dogecore = require('bitcore-lib-doge');
const { Transaction } = require('bitcore-lib-doge');
const { constructScript } = require('./constructScript');
const { fund } = require('./fund');

const parseDuneId = (id, claim = false) => {
  // Check if Dune ID is in the expected format
  const regex1 = /^\d+\:\d+$/;
  const regex2 = /^\d+\/\d+$/;

  if (!regex1.test(id) && !regex2.test(id))
    console.log(
      `Dune ID ${id} is not in the expected format e.g. 1234:1 or 1234/1`,
    );

  // Parse the id string to get height and index
  const [heightStr, indexStr] = regex1.test(id) ? id.split(':') : id.split('/');
  const height = parseInt(heightStr, 10);
  const index = parseInt(indexStr, 10);

  // Set the bits in the id using bitwise OR
  let duneId = (BigInt(height) << BigInt(16)) | BigInt(index);

  // For minting set CLAIM_BIT
  if (claim) {
    const CLAIM_BIT = BigInt(1) << BigInt(48);
    duneId |= CLAIM_BIT;
  }

  return duneId;
};

// mints rune by id if the mint period is open.
export const _mintDuneTx = async (
  wallet,
  id,
  amount,
  receiver,
  dunesBalance,
  doggyfiFee,
  doggyfiAddress,
) => {
  // Parse given id string to dune id
  const duneId = parseDuneId(id, true);

  // mint dune with encoded id, amount on output 1
  const edicts = [new Edict(duneId, amount, 1)];

  // Create script for given dune statements
  const script = constructScript(null, undefined, null, edicts);

  // getting the wallet balance
  let balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0);
  if (balance == 0) throw new Error('no funds');

  // creating new tx
  let tx = new Transaction();

  // output carries the protocol message
  tx.addOutput(
    new dogecore.Transaction.Output({ script: script, satoshis: 0 }),
  );

  // add receiver output holding dune amount
  tx.to(receiver, 100_000);

  // finally add doggyfi fee
  tx.to(doggyfiAddress, doggyfiFee);

  await fund(wallet, tx, dunesBalance);

  let serializedTx = tx.uncheckedSerialize();
  let _fees = tx.inputAmount - tx.outputAmount;

  // return tx with fees
  return {
    tx: serializedTx,
    fees: _fees,
  };
};
