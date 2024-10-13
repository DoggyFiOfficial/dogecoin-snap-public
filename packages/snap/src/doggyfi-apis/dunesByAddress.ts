// Get dunes by address from doggyfi-api
import { DuneResponse } from './interfaces';

/**
 * Fetch the dunes by address.
 *
 * @param address The address to fetch the dunes for.
 * @returns Json object with the dunes and cursor.
 */
export async function fetchDunesByAddress(
  address: string,
): Promise<DuneResponse | null> {
  const url = `https://api.doggyfi.xyz/dunes/balances/${address}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: DuneResponse = await response.json();

    return result;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
}
