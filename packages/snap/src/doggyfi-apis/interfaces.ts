export interface Inscription {
  inscription_id: string;
  offset: number;
}

export interface Dune {
  amount: string;
  dune_id: string;
}

export interface UTXO {
  hash: string;
  vout_index: number;
  address: string;
  value: number;
  confirmations: number;
  dunes: Dune[];
  inscriptions: Inscription[];
  scriptPubKey: string;
}

export interface DuneUTXO {
  txid: string;
  vout: number;
  address: string;
  script_pubkey: string;
  satoshis: string;
  confirmations: number;
  height: number;
  dune_amount: string;
}

export interface UnspentsResponseData {
  unspents: UTXO[];
  last_updated: {
    block_hash: string;
    block_height: number;
  };
  nextCursor: string | null;
}

export interface UTXOMapping {
  [txid: string]: UTXO;
}

export interface DuneData {
  [key: string]: string;
}

export interface LastUpdated {
  block_hash: string;
  block_height: number;
}

export interface DuneResponse {
  data: DuneData;
  last_updated: LastUpdated;
}

export interface DuneUtxoResponse {
  data: DuneUTXO[];
  last_updated: {
    block_hash: string;
    block_height: number;
  };
  nextCursor: string | null;
}

export interface DuneTerms {
  mint_txs_cap: number | null;
  amount_per_mint: number | null;
  start_height: number | null;
  end_height: number | null;
  start_offset: number | null;
  end_offset: number | null;
}

export interface DuneInfo {
  id: string;
  etching_cenotaph: boolean;
  etching_tx: string;
  etching_height: 5244140;
  name: string;
  spaced_name: string;
  symbol: string;
  divisibility: number;
  terms: DuneTerms;
  max_supply: number;
  mints: number;
  unique_holders: number;
  total_utxos: number;
}

export interface PushTxResponse {
  txid: string;
}

export interface ScriptSig {
  asm: string;
  hex: string;
}

export interface Vin {
  txid: string;
  vout: number;
  scriptSig: ScriptSig;
  sequence: number;
}

export interface ScriptPubKey {
  asm: string;
  hex: string;
  type: string;
  addresses: string[];
}

export interface Vout {
  value: number;
  n: number;
  scriptPubKey: ScriptPubKey;
}

export interface TxInfoResponse {
  txid: string;
  hex: string;
  size: number;
  vsize: number;
  vin: Vin[];
  vout: Vout[];
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
}

export interface Drc20BalByAddressResponse {
  data: Drc20BalData;
  last_updated: LastUpdated;
}

export interface Drc20BalData {
  [key: string]: Drc20Bal;
}

export interface Drc20Bal {
  total: string;
  available: string;
}

export interface Drc20Terms {
  maxSupply: number;
  decimals: number;
  lim: number;
}
export interface Drc20Info {
  deployInscriptionId: string;
  holders: number;
  ticker: string;
  terms: Drc20Terms;
}

export interface tipResponse {
  tip: string;
  tipAddress: string;
}
