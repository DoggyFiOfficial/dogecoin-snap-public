import dogecore, { Transaction } from 'bitcore-lib-doge';
import { Edict } from './edict';
import { constructScript } from './constructScript';
import { fund } from './fund';

const parseDuneId = (id, claim = false) => {
  // Check if Dune ID is in the expected format
  const regex1 = /^\d+\:\d+$/; // eslint-disable-line 
  const regex2 = /^\d+\/\d+$/; // eslint-disable-line

  if (!regex1.test(id) && !regex2.test(id)) {
    console.log(
      `Dune ID ${id} is not in the expected format e.g. 1234:1 or 1234/1`,
    );
  }

  // Parse the id string to get height and index
  const [heightStr, indexStr] = regex1.test(id) ? id.split(':') : id.split('/');
  const height = parseInt(heightStr, 10);
  const index = parseInt(indexStr, 10);

  // Set the bits in the id using bitwise OR
  let duneId = (BigInt(height) << BigInt(16)) | BigInt(index); // eslint-disable-line no-bitwise

  // For minting set CLAIM_BIT
  if (claim) {
    const CLAIM_BIT = BigInt(1) << BigInt(48); // eslint-disable-line no-bitwise
    duneId |= CLAIM_BIT; // eslint-disable-line no-bitwise
  }

  return duneId;
};

// mints rune by id if the mint period is open.
export const _mintDuneTx = async (
  wallet,
  id,
  amount,
  receiver,
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
  const balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0);
  if (balance === 0) {
    throw new Error('no funds');
  }

  // creating new tx
  const tx = new Transaction();

  // output carries the protocol message
  tx.addOutput(new dogecore.Transaction.Output({ script, satoshis: 0 }));

  // add receiver output holding dune amount
  tx.to(receiver, 100000);

  // finally add doggyfi fee
  tx.to(doggyfiAddress, doggyfiFee);

  await fund(wallet, tx);

  const serializedTx = tx.uncheckedSerialize();
  const _fees = tx.inputAmount - tx.outputAmount;

  // return tx with fees
  return {
    tx: serializedTx,
    fees: _fees,
  };
};
