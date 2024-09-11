// can push transactions to doggyfi-api
import { PushTxResponse } from './interfaces';

/**
 * Push a transaction to doggyfi-api.
 *
 * @param tx The transaction to push.
 * @returns Json object with the transaction id.
 */
export async function pushTransaction(
  tx: string,
): Promise<PushTxResponse | null> {
  const url = `https://api.doggyfi.xyz/tx/push`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: tx,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: PushTxResponse = await response.json();

  return result;
}
