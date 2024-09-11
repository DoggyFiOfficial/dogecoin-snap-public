// Makes a returns a json structure similar to how apezord wallet in doginals repo would make it
import { Dune, Inscription } from '../doggyfi-apis/interfaces';

export type Wallet = {
  privkey: string;
  address: string;
  utxos: APEUTXO[];
};

// apezord comptible utxo with dunes and inscriptions
export type APEUTXO = {
  txid: string;
  vout: number;
  satoshis: number;
  dunes: Dune[];
  inscriptions: Inscription[];
  script: string;
};

/**
 * Create 'Wallet' object that respects apezord schema.
 *
 * @param privkey - The private key.
 * @param address - The doge address.
 * @param utxos - The unspent transaction outputs.
 * @returns Wallet object.
 */
export function createWallet(
  privkey: string,
  address: string,
  utxos: APEUTXO[],
): Wallet {
  return {
    privkey,
    address,
    utxos,
  };
}
