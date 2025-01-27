// get's info about a transaction from doggyfi-api
import { TxInfoResponse } from './interfaces';

/**
 * Fetch the info about a transaction.
 *
 * @param txid - The transaction id.
 * @returns Json object with the info about the transaction.
 */
export async function fetchTxInfo(
  txid: string,
): Promise<TxInfoResponse | null> {
  const url = `https://api.doggyfi.xyz/tx/${txid}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TxInfoResponse = await response.json();

    return result;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
}
