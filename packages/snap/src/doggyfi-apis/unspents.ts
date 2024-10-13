import { UnspentsResponseData } from './interfaces';

/**
 * Fetch the UTXOs for an address
 *
 * @param address The address to fetch the UTXOs for.
 * @returns Response wrapped into a UXTOMapping object.
 */
export async function fetchUTXOs(
  address: string,
  cursor: string | null = null,
): Promise<UnspentsResponseData | null> {
  let url = `https://api.doggyfi.xyz/unspents/${address}`;
  if (cursor) {
    url += `?cursor=${cursor}`;
  }
  let response = await fetch(url);

  if (!response.ok) {
    console.error(`Failed to fetch UTXOs: ${response.statusText}`);
    return null;
  }

  let result: UnspentsResponseData = await response.json();

  while (result.next_cursor) {
    url = `https://api.doggyfi.xyz/unspents/${address}?cursor=${result.next_cursor}`;
    response = await fetch(url);
    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}, returning partial result`,
      );
      break;
    }
    result.unspents.push(...(await response.json()).unspents);
  }

  return result;
}
