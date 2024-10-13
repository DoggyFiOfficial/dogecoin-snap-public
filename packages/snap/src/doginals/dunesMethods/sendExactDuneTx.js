const { Transaction } = require('bitcore-lib-doge');
const { fund } = require('./fund');

export async function _sendExactDuneTx(wallet, toAddress, duneUtxo, doggyfiFee, doggyfiAddress) {
  // bulding a tx to send the dune
  let tx = new Transaction();
  // add the utxo as input
  tx.from(duneUtxo);
  tx.to(toAddress, 100_000);
  tx.to(doggyfiAddress, doggyfiFee);
  
  // fund the tx
  await fund(wallet, tx, true, true);

  // return serialized tx + fees
  return {
    tx: tx.uncheckedSerialize(),
    fees: tx.inputAmount - tx.outputAmount,
  };
}
