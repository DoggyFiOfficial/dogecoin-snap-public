// Method to filter for utxos by value
import { UTXO } from './doggyfi-apis/interfaces';

/**
 * Fetches the UTXOs for a Dogecoin address.
 *
 * @param unspents - The Dogecoin address to fetch UTXOs for.
 * @param value - The value to fetch UTXOs for.
 * @returns A promise that resolves to an array of DogeOrdUnspent objects.
 */
export async function getUtxosForValue( // TODO: Replace with DOGEORD get-utxos method
  unspents: UTXO[],
  value: number,
): Promise<UTXO[]> {
  // only keep enough unspents to cover the value
  // exclude anything with value 100,000 as these are likely inscriptions
  const filteredUnspents: UTXO[] = [];
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
