import { env } from '../fakeEnv';

const RPC_URL = String(env.GATSBY_RPC_URL);
const RPC_AUTH = String(env.GATSBY_API_KEY); // Note, this is only for testing purposes. In production, we will make available a globally rate limited API without a key.

// TODO: can we pass multiple hashes to pull everything in one go?
/**
 * Get transaction details from RPC.
 *
 * @param hash - The transaction hash.
 * @returns A promise of the transaction details.
 */
export async function getRpcTxDtails(hash: string): Promise<RPCTransaction> {
  const rpcurl = RPC_URL;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${RPC_AUTH}`,
  };
  try {
    // use fetch instead of axios
    const resp = (await fetch(rpcurl, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '1.0',
        id: 'doggyfi',
        method: 'getrawtransaction',
        params: [hash, true],
      }),
    }).then((r) => r.json())) as RPCTransactionDetails;

    // return json result
    console.log('getRpcTxDtails response: ', resp);
    return resp.result;
  } catch (err) {
    console.error(err);
    throw new Error(`Error fetching transaction details ${err}`);
  }
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

export const sendRawTransaction = async (txHex: string): Promise<any> => {
  const rpcuser = 'dogecoin';
  const rpcpassword = env.RPC_PASS;
  const rpcurl = env.RPC_URL;

  const resp = await fetch(rpcurl, {
    headers: {
      'Content-Type': 'text/plain',
      Authorization: `Basic ${btoa(`${rpcuser}:${rpcpassword}`)}`,
    },
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '1.0',
      id: 'doggyfi',
      method: 'sendrawtransaction',
      params: [txHex],
    }),
  }); // .then(r => r.json()) as { result: string }

  if (!resp.body) {
    throw new Error(await resp.text());
  }

  return resp; // resp.result as string
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
