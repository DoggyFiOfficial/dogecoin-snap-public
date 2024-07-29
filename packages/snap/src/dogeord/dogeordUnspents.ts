export type DogeOrdUnspent = {
  tx_hash: string;
  tx_output_n: number;
  address: string;
  value: string;
  confirmations: number;
  script: string;
};

/**
 * Fetches unspents for a Dogecoin address from the Dogeord API.
 *
 * @param address - The Dogecoin address to fetch unspents for.
 * @returns A promise that resolves to an array of DogeOrdUnspent objects.
 */
export async function getDogeOrdUnspents(
  address: string,
): Promise<DogeOrdUnspent[]> {
  // add address to the baseurl
  const url = `https://unspent.dogeord.io/api/v1/address/unspent/${address}`;

  // make a fetch request to the url
  const response = await fetch(url);

  // parse the response
  let data = await response.json();

  // check has field "unspent_outputs"
  if (!Object.prototype.hasOwnProperty.call(data, 'unspent_outputs')) {
    throw new Error('No unspent outputs found for this address');
  }

  // get the unspent outputs
  data = data.unspent_outputs;

  // make this json into a list of DogeOrdUnspent objects
  const unspents: DogeOrdUnspent[] = [];
  for (const unspent of data) {
    unspents.push({
      tx_hash: unspent.tx_hash,
      tx_output_n: unspent.tx_output_n,
      address: unspent.address,
      value: unspent.value,
      confirmations: unspent.confirmations,
      script: unspent.script,
    });
  }

  // return the data
  return data;
}
