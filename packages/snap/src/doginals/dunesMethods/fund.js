// sir duney methdod for adding fees and inputs

const getUtxosWithOutDunes = async (wallet) => {
  const nonDuneUtxos = [];
  // we added dunes and inscriptions to the utxos, so we can just filter out the ones that don't have dunes
  wallet.utxos.forEach((utxo) => {
    if (!(utxo.dunes && utxo.dunes.length > 0)) {
      nonDuneUtxos.push(utxo); // Keep UTXOs not associated with dunes
    }
  });

  if (nonDuneUtxos.length === 0) {
    throw new Error('No UTXOs without dunes found');
  }

  return nonDuneUtxos;
};

export async function fund(
  wallet,
  tx,
  onlySafeUtxos = true,
  filterDust = true,
) {
  // we get the utxos without dunes
  let utxosWithoutDunes;
  if (onlySafeUtxos) {
    utxosWithoutDunes = await getUtxosWithOutDunes(wallet);
  } else {
    utxosWithoutDunes = wallet.utxos;
  }

  if (filterDust || onlySafeUtxos) {
    // note inscriptions are almost always 100_000 satoshis, this is a safety check
    // we filter remove utxos that are <= 100_000 satoshis (shibes)
    utxosWithoutDunes = utxosWithoutDunes.filter(
      (utxo) => utxo.satoshis > 100_000,
    );
  }

  // we sort the largest utxos first
  const sortedUtxos = utxosWithoutDunes.slice().sort((a, b) => {
    return b.satoshis - a.satoshis;
  });

  // we filter for utxos that are larger than 1 DOGE
  const largeUtxos = sortedUtxos.filter((utxo) => {
    return utxo.satoshis > 100_000;
  });

  const outputSum = tx.outputs.reduce((acc, curr) => acc + curr.satoshis, 0);
  let isChangeAdded = false;
  let inputSumAdded = 0;

  for (const utxo of largeUtxos) {
    utxo.vout = Number(utxo.vout);
    utxo.satoshis = Number(utxo.satoshis);
    tx.from(utxo);
    delete tx._fee;

    tx.change(wallet.address);
    inputSumAdded += utxo.satoshis;

    if (inputSumAdded >= outputSum + tx._estimateFee()) {
      isChangeAdded = true;
      break;
    }
  }

  tx._fee = tx._estimateFee();
  tx.sign(wallet.privkey);

  if (!isChangeAdded) {
    throw new Error(
      'no change output added, need to add change output ' +
        (outputSum + tx._estimateFee()) +
        ' but added ' +
        inputSumAdded,
    );
  }

  if (tx.inputAmount < tx.outputAmount + tx.getFee()) {
    throw new Error('not enough (secure) funds');
  }
}
