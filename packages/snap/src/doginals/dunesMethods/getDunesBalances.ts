// Typescript implementation of dunesOutputsMaps from sir-duney
import { Wallet } from '../makeApezordWallet';
import { fetchUTXOs } from '../../doggyfi-apis/unspents';
import { fetchDuneInfo } from '../../doggyfi-apis/dunesInfo';

// TODO: remove this janky implementation after optimizing downstream code
export interface DuneBalance {
  txid: string;
  vout: number;
  balance: number;
  dune: string;
}

export async function getDuneBalances(
  wallet: Wallet,
): Promise<Object> {
  // dunesUtxosMappable via unspents method
  const unspents = wallet.utxos;
  const unspentsWithDunes = unspents.filter((utxo) => {
    return utxo.dunes && utxo.dunes.length > 0;
  });

  const duneOutputs: {[key: string]: DuneBalance} = {};
  const dunes = unspentsWithDunes.map((utxo) => {
    return utxo.dunes.map((dune) => {
      return { utxo, dune };
    });
  }).flat();
  const withDuneInfo = await Promise.all(dunes.map(async (dune) => {
    const duneInfo = await fetchDuneInfo(dune.dune.dune_id);
    if (duneInfo === null) {
      throw new Error('Could not fetch dune info');
    }
    return {
      ...dune,
      duneInfo,
    };
  }));
  withDuneInfo.forEach((dune) => {
    duneOutputs[`${dune.utxo.txid}:${dune.utxo.vout}`] = {
      txid: dune.utxo.txid,
      vout: dune.utxo.vout,
      balance: Number(dune.utxo.dunes[0].amount) * 10 ** dune.duneInfo.divisibility,
      dune: dune.duneInfo.name,
    };
  });

  return duneOutputs
}