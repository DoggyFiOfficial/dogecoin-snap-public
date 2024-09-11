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
): Promise<Map<string, DuneBalance>> {
  // dunesUtxosMappable via unspents method
  const unspents = wallet.utxos;
  const duneOutputMap = new Map<string, DuneBalance>();
  for (let i = 0; i < unspents.length; i++) {
    const utxo = unspents[i];
    if (utxo.dunes && utxo.dunes.length > 0) {
      for (const dune of utxo.dunes) {
        // todo, optimize downstream code to not rely on this...
        const duneInfo = await fetchDuneInfo(dune.dune_id);
        if (duneInfo === null) {
          throw new Error('Could not fetch dune info');
        }
        duneOutputMap.set(utxo.txid, {
          txid: utxo.txid,
          vout: utxo.vout,
          balance: Number(utxo.dunes[0].amount) * 10 ** duneInfo.divisibility,
          dune: duneInfo.name,
        });
      }
    }
  }
  return duneOutputMap;
}
