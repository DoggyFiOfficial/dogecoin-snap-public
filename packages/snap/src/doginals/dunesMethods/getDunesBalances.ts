// Typescript implementation of dunesOutputsMaps from sir-duney
import { Wallet } from '../makeApezordWallet';
import { fetchDuneInfo } from '../../doggyfi-apis/dunesInfo';

export type DuneBalance = {
  txid: string;
  vout: number;
  balance: number;
  dune: string;
};

/**
 * Retreives the balances of all dunes in a wallet.
 *
 * @param wallet - The wallet to get the balances of.
 * @returns The balances of all dunes in the wallet.
 */
export async function getDuneBalances(wallet: Wallet): Promise<{
  [key: string]: DuneBalance;
}> {
  // dunesUtxosMappable via unspents method
  const unspents = wallet.utxos;
  const unspentsWithDunes = unspents.filter((utxo) => {
    return utxo.dunes && utxo.dunes.length > 0;
  });

  const duneOutputs: { [key: string]: DuneBalance } = {};
  const dunes = unspentsWithDunes
    .map((utxo) => {
      return utxo.dunes.map((dune) => {
        return { utxo, dune };
      });
    })
    .flat();
  const withDuneInfo = await Promise.all(
    dunes.map(async (dune) => {
      const duneInfo = await fetchDuneInfo(dune.dune.dune_id);
      if (duneInfo === null) {
        throw new Error('Could not fetch dune info');
      }
      return {
        ...dune,
        duneInfo,
      };
    }),
  );
  withDuneInfo.forEach((dune) => {
    duneOutputs[`${dune.utxo.txid}:${dune.utxo.vout}`] = {
      txid: dune.utxo.txid,
      vout: dune.utxo.vout,
      balance:
        Number(dune.utxo.dunes[0].amount) * 10 ** dune.duneInfo.divisibility,
      dune: dune.duneInfo.name,
    };
  });

  return duneOutputs;
}
