// Retrieve tip rate from doggyfi-api

import { tipResponse } from "./interfaces";

export async function getTipRate(): Promise<tipResponse | null> {
  const url = `https://api.doggyfi.xyz/tip`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}