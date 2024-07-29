// Makes a returns a json structure similar to how apezord wallet in doginals repo would make it
export type UTXO = {
  txid: string;
  vout: number;
  script: string;
  satoshis: number;
};

export type Wallet = {
  privkey: string;
  address: string;
  utxos: UTXO[];
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
  utxos: UTXO[],
): Wallet {
  return {
    privkey,
    address,
    utxos,
  };
}
