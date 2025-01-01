// informational API to get the DRC20 token balance of an address
import { Drc20BalData } from './interfaces';

// example: https://api.doggyfi.xyz/drc/balances/D9Z3UEx7wz2zaKi9Rj98GTqFviQA8PoYt5

export const drc20BalByAddress = async (
  address: string,
): Promise<Drc20BalData> => {
  const response = await fetch(
    `https://api.doggyfi.xyz/drc/balances/${address}`,
  );
  const data = await response.json();
  if (data.ok) {
    return data.data;
  }
  return data;
};
