// Get drc20 info from doggyfi-api

import { Drc20Info } from './interfaces';

/**
 * Gets the DRC20 info.
 *
 * @param ticker - The ticker of the drc20 token.
 * @returns DRC20 info.
 */
export async function getDrc20Info(ticker: string): Promise<Drc20Info | null> {
  const url = `https://api.doggyfi.xyz/drc/info/${ticker}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}
