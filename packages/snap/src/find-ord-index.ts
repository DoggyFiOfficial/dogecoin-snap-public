// helper function to get the index of the ordinal in the outputs of a transaction
// necessary to determine exactly which utxo to spend to send a doginal
import { findContent } from './find-content';
import { TxInfoResponse } from './doggyfi-apis/interfaces';
import { getRpcTxDtails } from './queries';

const SHIBES_IN_DOGE = 100_000_000;

/**
 * Get the index on the vout's where the inscription was made.
 *
 * @param _tx - A RPCTransaction response of the hash for the reveal transaction.
 * @param _fromAddress - The dogecoin address that orginated the reveal transaction.
 * @param _content - The content as a hex string that should've been inscribed.
 * @returns A promise to the startIndex and endIndex where the inscription is.
 */
export async function getSatRange(
  _tx: TxInfoResponse,
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
  throw new Error(`Inscription not found on ${_tx.txid}`);
}
