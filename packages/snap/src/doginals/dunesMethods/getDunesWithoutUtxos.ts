// typescript implementation of getDunesWithoutUtxos from sirduney
// calls doggyfi api to get dune balance
import { readFileSync } from 'fs';
import { UTXO } from '../../doggyfi-apis/interfaces';
import { fetchUTXOs } from '../../doggyfi-apis/unspents';

type Wallet = {
  address: string;
  utxos: Utxo[];
};

type Utxo = {
  txid: string;
  vout: number;
};

const WALLET_PATH = process.env.WALLET_PATH || ''; // Ensure this path is set or handle appropriately

const getUtxosWithOutDunes = async (): Promise<UTXO[]> => {
  // Read wallet from file
  const wallet: Wallet = JSON.parse(readFileSync(WALLET_PATH, 'utf-8'));

  const utxos = await fetchUTXOs(wallet.address);

  if (utxos === null) {
    throw new Error('Could not fetch UTXOs');
  }

  const utxosWithoutDunes: UTXO[] = [];
  for (const utxo of utxos.unspents) {
    if (utxo.dunes && utxo.dunes.length === 0) {
      utxosWithoutDunes.push(utxo);
    }
  }

  return utxosWithoutDunes;
};

export default getUtxosWithOutDunes;
