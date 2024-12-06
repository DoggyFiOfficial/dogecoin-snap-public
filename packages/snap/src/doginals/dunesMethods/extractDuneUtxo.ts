import { fetchDuneInfo } from '../../doggyfi-apis/dunesInfo';
import { DuneInfo } from '../../doggyfi-apis/interfaces';
import { Wallet, APEUTXO } from '../makeApezordWallet'; // Assuming these types are defined elsewhere
import { bigIntToDecimalString, decimalToBigInt } from './bigIntMethods';

/**
 * Function to extract a specific dune utxo from the wallet.
 *
 * @param wallet - Apezord compatable wallet.
 * @param amount - The amount to extract.
 * @param dune - The dune to extract.
 * @returns The utxo and dune info.
 */
export async function extractDuneUtxo(
  wallet: Wallet,
  amount: string,
  dune: string,
): Promise<{ utxo: APEUTXO; info: DuneInfo } | null> {
  // get id for the dune
  const resp = await fetchDuneInfo(dune);
  if (resp === null) {
    throw new Error('Could not fetch dune info');
  }
  const duneID = resp.id;
  const decimals = resp.divisibility;
  const duneUtxos: APEUTXO[] = [];
  for (const utxo of wallet.utxos) {
    if (utxo.dunes.length > 0 && utxo.dunes[0].dune_id === duneID) {
      const stringDec = bigIntToDecimalString(amount, decimals);
      if (utxo.dunes[0].amount === stringDec) {
        duneUtxos.push(utxo);
        break;
      }
    }
  }
  return { utxo: duneUtxos[0], info: resp };
}

/**
 * Sums the decimal parts of the input amounts and returns a string with the correct decimal placement.
 *
 * @param amounts - An array of decimal strings.
 * @param decimals - The number of decimals.
 * @returns A string with the correct decimal placement.
 */
function sumDecimalStrings(amounts: string[], decimals: number): string {
  // Determine the maximum number of decimal places in the input amounts
  let totalAmount = BigInt(0);
  for (const amount of amounts) {
    // Normalize each amount to the maxDecimals by padding with zeros
    if (amount.includes('e')) {
      throw new Error('Amounts must not include scientific notation!');
    }
    const [integerPart, fractionalPart = ''] = amount.split('.');
    const normalizedAmount = integerPart + fractionalPart.padEnd(decimals, '0');
    totalAmount += BigInt(normalizedAmount);
  }

  // Convert the total back to a string with the correct decimal placement
  const totalString = totalAmount.toString();
  const integerPartLength = totalString.length - decimals;

  return integerPartLength > 0
    ? `${totalString.slice(0, integerPartLength)}.${totalString.slice(
        integerPartLength,
      )}`
    : `0.${'0'.repeat(-integerPartLength)}${totalString}`;
}

/**
 * Gets the Dune UTXOs that can at least cover the the total amount to send.
 *
 * @param wallet - Apezord Wallet object.
 * @param amounts - Human interpretable amounts based on divisibility.
 * @param dune - Name of the dune.
 * @param checkForSingleUtxo - Whether to check for a single utxo.
 * @returns A promise that resolves to an object containing the specific dune utxos, the dune info, and the total amount.
 */
export async function extractDuneUtxos(
  wallet: Wallet,
  amounts: string[],
  dune: string,
  checkForSingleUtxo = false,
): Promise<{
  duneUtxos: APEUTXO[];
  duneInfo: DuneInfo;
  totalAmount: string;
} | null> {
  // first check if the exact amounts can be covered
  const resp = await fetchDuneInfo(dune);
  if (resp === null) {
    throw new Error('Could not fetch dune info');
  }
  const totalAmount = sumDecimalStrings(amounts, resp.divisibility);
  const totalAmountBigInt = decimalToBigInt(totalAmount, resp.divisibility);

  if (checkForSingleUtxo) {
    const _ = await extractDuneUtxo(wallet, totalAmount.toString(), dune);

    if (_ !== null) {
      if (_.utxo) {
        return {
          duneUtxos: [_.utxo],
          duneInfo: _.info,
          totalAmount: totalAmount.toString(),
        };
      }
    }
  }
  // get id for the dune
  const duneID = resp.id;

  // first, let's isolate only the utxos that match the dune
  const _duneUtxos: APEUTXO[] = [];
  for (const utxo of wallet.utxos) {
    if (
      utxo &&
      'dunes' in utxo &&
      utxo.dunes &&
      utxo.dunes.length > 0 &&
      utxo.dunes[0].dune_id === duneID
    ) {
      _duneUtxos.push(utxo);
    }
  }

  // next, let's sort the utxos by the dune amount
  // parseFloat should be fine here as it returns a number which is bigger than dunes cap.
  _duneUtxos.sort((a, b) => {
    return parseFloat(b.dunes[0].amount) - parseFloat(a.dunes[0].amount);
  });

  // now, let's add the utxos to the final list
  let amountAcc = BigInt(0);
  const finalDuneUtxos: APEUTXO[] = [];

  for (const utxo of _duneUtxos) {
    const duneBalance = utxo.dunes[0];
    if (amountAcc >= totalAmountBigInt) {
      break;
    }
    const _ = await extractDuneUtxo(
      wallet,
      duneBalance.amount.toString(),
      dune,
    );
    if (_ !== null) {
      finalDuneUtxos.push(utxo);
      amountAcc += decimalToBigInt(
        utxo.dunes[0].amount,
        Number(_.info.divisibility),
      );
    }
  }

  if (finalDuneUtxos.length === 0) {
    return null;
  }

  return {
    duneUtxos: finalDuneUtxos,
    duneInfo: resp,
    totalAmount: bigIntToDecimalString(
      amountAcc.toString(),
      Number(resp.divisibility),
    ),
  };
}
