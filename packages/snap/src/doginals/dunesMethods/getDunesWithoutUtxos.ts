// typescript implementation of getDunesWithoutUtxos from sirduney
// calls public indexer (https://ord.dunesprotocol.com/)
import { readFileSync } from 'fs';

interface Wallet {
  address: string;
  utxos: Utxo[];
}

interface Utxo {
  txid: string;
  vout: number;
}

interface Dune {
  dune: string;
  balances: Balance[];
}

interface Balance {
  txid: string;
  vout: number;
  // Add other properties as needed
}

interface DuneBalanceResponse {
  dunes: Dune[];
}

const WALLET_PATH = process.env.WALLET_PATH || ''; // Ensure this path is set or handle appropriately

const getUtxosWithOutDunes = async (): Promise<Utxo[]> => {
  // Read wallet from file
  let wallet: Wallet = JSON.parse(readFileSync(WALLET_PATH, 'utf-8'));

  // Fetch wallet balance from Ord
  const response = await fetch(
    `${'https://ord.dunesprotocol.com/'}dunes/balance/${
      wallet.address
    }?show_all=true`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const walletBalanceFromOrd: DuneBalanceResponse = await response.json();

  // Create a map of dune outputs
  const duneOutputMap = new Map<string, Balance & { dune: string }>();
  for (const dune of walletBalanceFromOrd.dunes) {
    for (const balance of dune.balances) {
      duneOutputMap.set(`${balance.txid}:${balance.vout}`, {
        ...balance,
        dune: dune.dune,
      });
    }
  }

  // Filter UTXOs that are not in the dune output map
  return wallet.utxos.filter(
    (utxo) => !duneOutputMap.has(`${utxo.txid}:${utxo.vout}`),
  );
};

export default getUtxosWithOutDunes;
