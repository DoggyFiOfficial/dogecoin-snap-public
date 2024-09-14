// Get utxos for a dune from doggyfi-api
import { DuneUtxoResponse } from './interfaces';

/**
 * Fetch the utxos for a dune.
 *
 * @param dune Either the dune id or the dune name without spaces.
 * @returns Json object with the utxos for the dune and cursor.
 */
export async function fetchDuneData(
  dune: string,
  cursor: string | null = null,
): Promise<DuneUtxoResponse | null> {
  let url = `https://api.doggyfi.xyz/dunes/utxo/${dune}`;
  if (cursor) {
    url += `?cursor=${cursor}`;
  }

  let response = await fetch(url);

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    return null;
  }

  let result: DuneUtxoResponse = await response.json();

  while (result.next_cursor) {
    url = `https://api.doggyfi.xyz/dunes/utxo/${dune}?cursor=${result.next_cursor}`;
    response = await fetch(url);
    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}, returning partial result`,
      );
      break;
    }
    result.data.push(...(await response.json()).data);
  }

  return result;
}