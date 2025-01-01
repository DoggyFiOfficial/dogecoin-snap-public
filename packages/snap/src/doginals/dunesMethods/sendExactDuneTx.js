import { Transaction } from 'bitcore-lib-doge';
import { fund } from './fund';

/**
 * Makes a tx to send an exact dune to a given address.
 *
 * @param {*} wallet - An Apezord wallet.
 * @param {*} toAddress - The address to send the dune to.
 * @param {*} duneUtxo - The utxo to send the dune from.
 * @param {*} doggyfiFee - The doggyfi fee to add.
 * @param {*} doggyfiAddress - The doggyfi address to send the doggyfi fee to.
 * @returns {{tx: any; fees: number;}} Dogecoin transaction and fees.
 */
export async function _sendExactDuneTx(
  wallet,
  toAddress,
  duneUtxo,
  doggyfiFee,
  doggyfiAddress,
) {
  // bulding a tx to send the dune
  const tx = new Transaction();
  // add the utxo as input
  tx.from(duneUtxo);
  tx.to(toAddress, 100000);
  tx.to(doggyfiAddress, doggyfiFee);

  // fund the tx
  fund(wallet, tx, true, true);

  // return serialized tx + fees
  return {
    tx: tx.uncheckedSerialize(),
    fees: tx.inputAmount - tx.outputAmount,
  };
}
