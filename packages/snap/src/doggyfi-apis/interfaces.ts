export type Inscription = {
  inscription_id: string;
  offset: number;
};

export type Dune = {
  amount: string;
  dune_id: string;
};

export type UTXO = {
  hash: string;
  vout_index: number;
  address: string;
  value: number;
  confirmations: number;
  dunes: Dune[];
  inscriptions: Inscription[];
  scriptPubKey: string;
};

export type DuneUTXO = {
  txid: string;
  vout: number;
  address: string;
  script_pubkey: string;
  satoshis: string;
  confirmations: number;
  height: number;
  dune_amount: string;
};

export type UnspentsResponseData = {
  unspents: UTXO[];
  last_updated: {
    block_hash: string;
    block_height: number;
  };
  nextCursor: string | null;
};

export type UTXOMapping = {
  [txid: string]: UTXO;
};

export type DuneData = {
  [key: string]: string;
};

export type LastUpdated = {
  block_hash: string;
  block_height: number;
};

export type DuneResponse = {
  data: DuneData;
  last_updated: LastUpdated;
};

export type DuneUtxoResponse = {
  data: DuneUTXO[];
  last_updated: {
    block_hash: string;
    block_height: number;
  };
  nextCursor: string | null;
};

export type DuneTerms = {
  mint_txs_cap: number | null;
  amount_per_mint: number | null;
  start_height: number | null;
  end_height: number | null;
  start_offset: number | null;
  end_offset: number | null;
};

export type DuneInfo = {
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
};

export type PushTxResponse = {
  txid: string;
};

export type ScriptSig = {
  asm: string;
  hex: string;
};

export type Vin = {
  txid: string;
  vout: number;
  scriptSig: ScriptSig;
  sequence: number;
};

export type ScriptPubKey = {
  asm: string;
  hex: string;
  type: string;
  addresses: string[];
};

export type Vout = {
  value: number;
  n: number;
  scriptPubKey: ScriptPubKey;
};

export type TxInfoResponse = {
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
};

export type Drc20BalByAddressResponse = {
  data: Drc20BalData;
  last_updated: LastUpdated;
};

export type Drc20BalData = {
  [key: string]: Drc20Bal;
};

export type Drc20Bal = {
  total: string;
  available: string;
};

export type Drc20Terms = {
  maxSupply: number;
  decimals: number;
  lim: number;
};

export type Drc20Info = {
  deployInscriptionId: string;
  holders: number;
  ticker: string;
  terms: Drc20Terms;
};

export type tipResponse = {
  tip: string;
  tipAddress: string;
};
