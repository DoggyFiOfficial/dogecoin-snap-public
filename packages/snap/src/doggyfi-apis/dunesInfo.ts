// Get dune info from doggyfi-api
import { DuneInfo } from './interfaces';

/**
 * Fetch the dune info.
 *
 * @param dune - Either the dune id or the dune name without spaces.
 * @returns Json object with the dune info.
 */
export async function fetchDuneInfo(dune: string): Promise<DuneInfo | null> {
  const url = `https://api.doggyfi.xyz/dunes/info/${dune}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: DuneInfo = await response.json();

    return result;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
}
