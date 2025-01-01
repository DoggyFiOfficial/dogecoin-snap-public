import { UnspentsResponseData } from './interfaces';

/**
 * Fetch the UTXOs for an address.
 *
 * @param address - The address to fetch the UTXOs for.
 * @param cursor - The cursor to fetch the UTXOs from.
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

  const result: UnspentsResponseData = await response.json();

  while (result.nextCursor) {
    url = `https://api.doggyfi.xyz/unspents/${address}?cursor=${result.nextCursor}`;
    response = await fetch(url);
    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}, returning partial result`,
      );
      break;
    }
    const resp = await response.json();
    result.unspents.push(...resp.unspents);
    result.nextCursor = resp.nextCursor;
  }

  return result;
}
