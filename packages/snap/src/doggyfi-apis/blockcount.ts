// Get block count from doggyfi-api

/**
 * Fetch the block count from doggyfi-api.
 *
 * @returns Json object with the block count.
 */
export async function fetchBlockCount(): Promise<number | null> {
  const url = `https://api.doggyfi.xyz/blocks/count`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: number = await response.json();

    return result;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
}
