// helper function to get the index of the ordinal in the outputs of a transaction
// necessary to determine exactly which utxo to spend to send a doginal
import { env } from '../fakeEnv';
import { findContent } from './find-content';

const SHIBES_IN_DOGE = 100_000_000;
const RPC_URL = String(env.GATSBY_RPC_URL);
const RPC_AUTH = String(env.GATSBY_API_KEY); // Note, this is only for testing purposes. In production, we will make available a globally rate limited API without a key.
type ScriptSig = {
  asm: string;
  hex: string;
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

/**
 * Get the transaction details from a dogecoin hash.
 *
 * @param hash - The dogecoin transaction hash.
 * @returns A promise to a RPCTransaction containing the transaction details.
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

/**
 * Get the index on the vout's where the inscription was made.
 *
 * @param _tx - A RPCTransaction response of the hash for the reveal transaction.
 * @param _fromAddress - The dogecoin address that orginated the reveal transaction.
 * @param _content - The content as a hex string that should've been inscribed.
 * @returns A promise to the startIndex and endIndex where the inscription is.
 */
export async function getSatRange(
  _tx: RPCTransaction,
  _fromAddress: string,
  _content: string,
): Promise<{ startIndex: number; endIndex: number }> {
  // Step 1, walk each input until you find the content, count the value accumulated...
  let accumulatedValue = 0;
  /* eslint-disable */
  for (let i = 0; i < _tx.vin.length; i++) {
    // get the value that was sent to the address on the input feeding it
    const vinTx = await getRpcTxDtails(_tx.vin[i].txid);
    /* eslint-disable */
    for (let j = 0; j < vinTx.vout.length; j++) {
      if (
        vinTx.vout[j].scriptPubKey.addresses[0] === _fromAddress &&
        vinTx.vout[j].n === _tx.vin[i].vout
      ) {
        accumulatedValue += vinTx.vout[j].value * SHIBES_IN_DOGE;
        break;
      }
    }
    /* eslint-enable */

    // disect the content
    /* eslint-disable */
    const { contentType, content, hasPointer, pointer } = findContent(
      _tx.vin[i].scriptSig.asm.split(' '),
    );
    /* eslint-enable */
    if (contentType === '') {
      continue;
    }

    // validate that content is equal to content expected...
    if (content === _content) {
      const plainContentType: string = Buffer.from(contentType, 'hex').toString(
        'utf-8',
      );
      // check if it contains "text/plain" or "application/json"
      if (
        !(
          plainContentType.includes('text/plain') ||
          plainContentType.includes('application/json')
        )
      ) {
        throw new Error('Invalid content type, inscription is invalid');
      }
    } else {
      continue;
    }

    // walk the outputs to figure out which output index it's on
    // it will be on the first sat of the output block it maps into
    // which is 1:1 based on the number of input sats
    // see
    // https://docs.ordinals.com/faq.html
    let remainingValue = 0;
    if (hasPointer) {
      // TODO: is this conversation correct?
      throw new Error('Pointers not supported yet');
      // remainingValue += parseInt(pointer, 16) * 100_000;
    } else {
      remainingValue += accumulatedValue;
    }
    let index = 0;

    /* eslint-disable */
    for (let k = 0; k < _tx.vout.length; k++) {
      remainingValue -= _tx.vout[k].value * SHIBES_IN_DOGE;
      if (remainingValue <= 0) {
        const startIndex = index;
        const endIndex = index;
        return { startIndex, endIndex };
      }
      index += 1;
    }
    /* eslint-enable */
  }
  throw new Error(`Inscription not found on ${_tx.hash}`);
}
