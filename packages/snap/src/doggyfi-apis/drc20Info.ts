// Get drc20 info from doggyfi-api

import { Drc20Info } from "./interfaces";

// example: https://api.doggyfi.xyz/drc/info/dogi

export async function getDrc20Info(ticker: string): Promise<Drc20Info | null> {
  const url = `https://api.doggyfi.xyz/drc/info/${ticker}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}