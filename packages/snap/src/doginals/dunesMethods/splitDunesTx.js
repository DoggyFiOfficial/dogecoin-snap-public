// sir-duney & booktoshi approach for splitting dunes
const dogecore = require('bitcore-lib-doge');
const { constructScript } = require('./constructScript');
const { Transaction } = require('bitcore-lib-doge');
const { Edict } = require('./edict');
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

export const _splitDunesUtxosTx = async (
  wallet,
  toAddresses,
  id,
  dunesUtxos,
  amountsOut,
  doggyfiFee,
  doggyfiFeeAddress,
) => {
  if (amountsOut.length !== toAddresses.length) {
    throw new Error('Amounts out must be the same length as addresses');
  }

  // Create a new transaction
  let tx = new Transaction();

  // add all Dunes UTXOs as inputs
  for (const utxo of dunesUtxos) {
    tx.from(utxo);
  }
  // parse duneId
  const duneId = parseDuneId(id);

  // Add edicts to a mintStone
  // This will add the wrong dunes to the protocol message if dunesBalances contains more than just the dune referenced by the id
  let edicts = [];
  for (let i = 0; i < amountsOut.length; i++) {
    // note: we use offset at 2 send dunes going to send start at index 2
    edicts.push(new Edict(duneId, amountsOut[i], i + 2));
  }
  
  // output made at vout 1 to send unallocated dunes to self
  const mintStone = constructScript(null, 1, null, edicts);
  // Add output with OP_RETURN Dune assignment script
  tx.addOutput(
    new dogecore.Transaction.Output({ script: mintStone, satoshis: 0 }),
  );

  // add rune change to self first.
  tx.to(wallet.address, 100_000);

  // add one output for each address
  for (const address of toAddresses) {
    tx.to(address, 100_000);
  }

  // finally add doggyfi fee
  tx.to(doggyfiFeeAddress, doggyfiFee);

  // fund the tx
  await fund(wallet, tx, true, true);

  // return serialized tx along with fees
  const uncheckedSerialize = tx.uncheckedSerialize();
  return {
    tx: uncheckedSerialize,
    fees: tx.inputAmount - tx.outputAmount,
  };
};

// Note dune id info is passed in by the caller from the ts getDune Method.
export const _splitDuneTx = async (
  wallet,
  amounts,
  addresses,
  id,
  dune_utxo,
  doggyfi,
  doggyfiFeeAddress,
) => {
  // Define default output where the sender receives unallocated dunes
  const DEFAULT_OUTPUT = 1;
  // Define output offset for receivers of dunes
  const OFFSET = 2;

  let tx = new Transaction();

  tx.from(dune_utxo);

  // parse given id string to dune id
  const duneId = parseDuneId(id);

  /**
   * we have an index-offset of 2
   * - the first output (index 0) is the protocol message
   * - the second output (index 1) is where we put the dunes which are on input utxos which shouldn't be transfered
   *
   */
  const edicts = [];
  for (let i = 0; i < amounts.length; i++) {
    edicts.push(new Edict(duneId, amounts[i], i + OFFSET));
  }

  // Create payload and parse it into an OP_RETURN script with protocol message
  const script = constructScript(null, DEFAULT_OUTPUT, null, edicts);

  // Add output with OP_RETURN Dune assignment script
  tx.addOutput(
    new dogecore.Transaction.Output({ script: script, satoshis: 0 }),
  );

  // add one output to the sender for the dunes that are not transferred
  tx.to(wallet.address, 100_000);

  // add doggyfi fee
  tx.to(doggyfiFeeAddress, doggyfi);

  // the output after the protocol message will carry the dune balance if no payload is specified
  for (const address of addresses) {
    tx.to(address, 100_000);
  }

  // we fund the tx
  await fund(wallet, tx, true, true);

  // return serialized tx along with fees
  return {
    tx: tx.uncheckedSerialize(),
    fees: tx.inputAmount - tx.outputAmount,
  };
};
