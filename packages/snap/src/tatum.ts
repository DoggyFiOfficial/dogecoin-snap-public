import { env } from '../fakeEnv';
import { TatumFees } from './tatum-types';
import { getRpcTxDtails, Transaction } from './queries';

// Note, this is only for testing purposes.
// In production, we will make available a globally rate limited API without a key.
const RPC_URL = String(env.GATSBY_RPC_URL);
const RPC_AUTH = String(env.GATSBY_API_KEY);

export type DogeOrdUnspent = {
  tx_hash: string;
  tx_output_n: number;
  address: string;
  value: string;
  confirmations: number;
  script: string;
};

/**
 * Fetches unspents for a Dogecoin address from the Dogeord API.
 *
 * @param address - The Dogecoin address to fetch unspents for.
 * @returns A promise that resolves to an array of DogeOrdUnspent objects.
 */
export async function getDogeOrdUnspents(
  address: string,
): Promise<DogeOrdUnspent[]> {
  // add address to the baseurl
  const url = `https://unspent.dogeord.io/api/v1/address/unspent/${address}`;

  // make a fetch request to the url
  const response = await fetch(url);

  // parse the response
  const data = await response.json();

  // check has field "unspent_outputs"
  if (!Object.prototype.hasOwnProperty.call(data, 'unspent_outputs')) {
    throw new Error('No unspent outputs found for this address');
  }

  // make this json into a list of DogeOrdUnspent objects
  const unspents: DogeOrdUnspent[] = [];
  /* eslint-disable */
  for (let i = 0; i < data.unspent_outputs.length; i++) {
    const unspent = data.unspent_outputs[i];
    unspents.push({
      tx_hash: unspent.tx_hash,
      tx_output_n: unspent.tx_output_n,
      address: unspent.address,
      value: unspent.value,
      confirmations: unspent.confirmations,
      script: unspent.script,
    });
  }
  /* eslint-enable */

  // return the data
  return data;
}

/**
 * Fetches all transactions for a Dogecoin address.
 *
 * @param address - The Dogecoin address to fetch transactions for.
 * @returns A promise that resolves to an array of Transaction objects.
 */
export async function getAllTxnsForAddress( // TODO: Replace with Transaction response from RPC response
  address: string,
): Promise<Transaction[]> {
  // get all hashes by making a call to dogeord
  const txs = await getDogeOrdUnspents(address);

  const transactions: Transaction[] = [];
  /* eslint-disable */
  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const txDetails = await getRpcTxDtails(tx.tx_hash);
    transactions.push(txDetails);
  }
  /* eslint-enable */

  return transactions;
}

/**
 * Fetches the balance for a Dogecoin address.
 *
 * @param address - The Dogecoin address to fetch the balance for.
 * @returns A promise that resolves to the balance of the address.
 */
export async function getBalanceForAddress(address: string): Promise<number> {
  // fetch unspents for the address
  const unspents = await getDogeOrdUnspents(address);

  // calculate the balance by summing the values of the unspents
  let balance = 0;
  /* eslint-disable */
  for (let i = 0; i < unspents.length; i++) {
    balance += Number(unspents[i].value);
  }
  /* eslint-enable */

  return balance;
}

/**
 * Fetches the transaction details for a Dogecoin transaction hash.
 *
 * @param txHash - The transaction hash.
 * @returns A promise of the transaction details.
 */
export async function getTxByHash(txHash: string): Promise<Transaction> {
  // TODO: Replace with RPC get-transaction method
  return await getRpcTxDtails(txHash);
}

/**
 * Fetches the UTXOs for a Dogecoin address.
 *
 * @param address - The Dogecoin address to fetch UTXOs for.
 * @param value - The value to fetch UTXOs for.
 * @returns A promise that resolves to an array of DogeOrdUnspent objects.
 */
export async function getUtxosForValue( // TODO: Replace with DOGEORD get-utxos method
  address: string,
  value: number,
): Promise<DogeOrdUnspent[]> {
  // get all unspents for the address
  const unspents = await getDogeOrdUnspents(address);

  // only keep enough unspents to cover the value
  // exclude anything with value 100,000 as these are likely inscriptions
  const filteredUnspents = [];
  let totalValue = 0;

  /* eslint-disable */
  for (let i = 0; i < unspents.length; i++) {
    if (Number(unspents[i].value) !== 100000) {
      filteredUnspents.push(unspents[i]);
    }
    totalValue += Number(unspents[i].value);
    if (totalValue >= value) {
      break;
    }
  }
  /* eslint-enable */

  return filteredUnspents;
}

export const getFees = (): TatumFees => {
  // TODO: Replace with hardcode (or avg fee api?)
  // hardcode a fee rate into tatum fees
  // TODO, replace with doggyfi API
  const fees: TatumFees = {
    fast: 250000,
    medium: 200000,
    slow: 150000,
    block: 1,
    time: '1',
  };

  return fees;
};

/**
 * Fetches the transaction hex for a Dogecoin transaction hash.
 *
 * @param txHash - The transaction hash.
 * @returns A promise of the transaction hex.
 */
export async function getTransactionHex(txHash: string): Promise<string> {
  return (await getRpcTxDtails(txHash)).hex;
}

export type PushTransactionResponse = {
  result: string | null;
  error: {
    code: number;
    message: string;
  } | null;
  id: string;
};

export const pushTransaction = async (txHex: string): Promise<string> => {
  const rpcurl = RPC_URL;

  const resp = (await fetch(rpcurl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${RPC_AUTH}`,
    },
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '1.0',
      method: 'sendrawtransaction',
      params: [txHex],
    }),
  }).then((r) => r.json())) as PushTransactionResponse;

  if (resp.result) {
    return resp.result;
  }
  throw new Error(resp.error?.message);
};

/**
 * Broadcasts a signed transaction to the Dogecoin network.
 *
 * @param txData - The signed transaction hex.
 * @param retry - Whether to retry if the transaction fails to broadcast.
 * @returns A promise of the transaction hash.
 */
export async function broadcastSignedTransaction(
  txData: string,
  retry = true,
): Promise<string> {
  let res;
  let msg;
  try {
    res = await pushTransaction(txData);
    return res;
  } catch (e) {
    while (retry) { // eslint-disable-line
      if (msg?.includes('too-long-mempool-chain')) {
        console.warn('retrying in 15 secs, too-long-mempool-chain');
        await new Promise((resolve) => setTimeout(resolve, 15000));
        try {
          res = await pushTransaction(txData);
          return res;
        } catch (innerError) {
          msg = innerError.response?.data?.error?.message;
        }
      } else {
        throw e;
      }
    }
    throw e;
  }
}
