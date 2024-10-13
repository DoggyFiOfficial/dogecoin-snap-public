import { pushTransaction } from './doggyfi-apis/pushTransaction';
import { fetchTxInfo } from './doggyfi-apis/getTxInfo';
import { fetchBlockCount } from './doggyfi-apis/blockcount';
import { TxInfoResponse } from './doggyfi-apis/interfaces';
interface UTXO {
  txid: string;
  vout: number;
  address: string;
  script_pubkey: string;
  satoshis: string;
  confirmations: number;
  height: number;
  dune_amount: string;
}

interface LastUpdated {
  block_hash: string;
  block_height: number;
}

export interface UTXOResponse {
  utxos: UTXO[];
  lastUpdated: LastUpdated;
  nextCursor: string;
}

/**
 * Method to get the block count from the RPC.
 *
 * @returns A promise of the block count.
 */
export async function getBlockCount(): Promise<number | null> {
  return await fetchBlockCount();
}

// TODO: can we pass multiple hashes to pull everything in one go?
/**
 * Get transaction details from RPC.
 *
 * @param hash - The transaction hash.
 * @returns A promise of the transaction details.
 */
export async function getRpcTxDtails(hash: string): Promise<TxInfoResponse> {
  const res = await fetchTxInfo(hash);

  // check if res is null
  if (res === null) {
    throw new Error('Error fetching transaction details');
  }

  return res;
}

export type RpcUnspentOutput = {
  txid: string;
  vout: 0;
  address: string;
  scriptPubKey: string;
  amount: 2;
  confirmations: 700;
};

export type PushTransactionResponse = {
  result: string | null;
  error: {
    code: number;
    message: string;
  } | null;
  id: string;
};

type RPCVin = {
  txid: string;
  vout: number;
  scriptSig: ScriptSig;
  sequence: number;
};

type RPCVout = {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs: number;
    type: string;
    addresses: string[];
  };
};

export type RPCTransaction = {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  locktime: number;
  vin: RPCVin[];
  vout: RPCVout[];
  hex: string;
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
};

export const sendRawTransaction = async (txHex: string): Promise<string> => {
  return (await pushTransaction(txHex))?.txid ?? '';
};

type ScriptSig = {
  asm: string;
  hex: string;
};

type Vin = {
  txid: string;
  vout: number;
  scriptSig: ScriptSig;
  sequence: number;
};

type Vout = {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs: number;
    type: string;
    addresses: string[];
  };
};

export type Transaction = {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  hex: string;
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
};

export type RPCTransactionDetails = {
  result: Transaction;
};
