// gets estimated fee rate from doggyfi-api

/**
 * Gets the fee rate.
 *
 * @returns Estimated fee rate.
 */
export async function getFeeRate(): Promise<number | null> {
  const url = `https://api.doggyfi.xyz/feeRate`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: number = await response.json().then((r) => r.feeRate);

    return result;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
}
