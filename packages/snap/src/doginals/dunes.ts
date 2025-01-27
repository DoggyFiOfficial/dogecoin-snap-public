// typescipt methods for managing dunes assets
import { getBlockCount } from '../queries';
import { fetchDuneInfo } from '../doggyfi-apis/dunesInfo';
import { _getOpenDuneTx } from './dunesMethods/openDuneTx';
import { _splitDunesUtxosTx } from './dunesMethods/splitDunesTx';
import { _mintDuneTx } from './dunesMethods/mintDunesTx';
import { _sendExactDuneTx } from './dunesMethods/sendExactDuneTx';
import { Wallet, APEUTXO } from './makeApezordWallet';
import { extractDuneUtxos } from './dunesMethods/extractDuneUtxo';
import { getDuneBalances, DuneBalance } from './dunesMethods/getDunesBalances';
import { decimalToBigInt } from './dunesMethods/bigIntMethods';

/**
 * Checks which utxos don't have dunes based on a list of dunes for the wallet.
 *
 * @param wallet - The apezord wallet to check.
 * @param dunes - The list of dunes to check.
 * @returns The list of utxos without dunes.
 */
export async function utxosWithoutDunes(
  wallet: Wallet,
  dunes: string[],
): Promise<APEUTXO[]> {
  // base case is dunes is empty list, return all utxos on the wallet
  if (dunes.length === 0) {
    return wallet.utxos;
  }

  // get list of all utxos for the wallet
  const safeUtxos: APEUTXO[] = [];
  for (const utxo of wallet.utxos) {
    if (utxo.dunes.length === 0) {
      safeUtxos.push(utxo);
    }
  }
  return safeUtxos;
}

/**
 * Open a dune and send it to the receiver.
 *
 * @param wallet - The wallet to use.
 * @param tick - The tick of the dune to open.
 * @param symbol - The symbol of the dune to open.
 * @param limit - Optional, the limit of the dune to open.
 * @param divisibility - The divisibility of the dune to open.
 * @param cap - Optional The cap of the dune to open.
 * @param heightStart - Optional, the block height start of the dune to open.
 * @param heightEnd - Optional, the block height end of the dune to open.
 * @param offsetStart - Optional, the offset start of the dune to open.
 * @param offsetEnd - Optional, the offset end of the dune to open.
 * @param premine - The premine of the dune to open.
 * @param turbo - If true subscribed to protocol uprgrades.
 * @param openMint - If true, the dune can be minted uninterrupted until it is closed.
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @returns The transaction and the fees.
 */
export async function openDuneTx(
  wallet: Wallet,
  tick: string,
  symbol: string,
  limit: string | null,
  divisibility: number,
  cap: string | null,
  heightStart: number | null,
  heightEnd: number | null,
  offsetStart: number | null,
  offsetEnd: number | null,
  premine: string,
  turbo: boolean,
  openMint: boolean,
  doggyfiFee: number,
  doggyfiAddress: string,
): Promise<[string, number]> {
  const blockCount = await getBlockCount();
  if (blockCount === null) {
    throw new Error('Could not fetch block count');
  }
  const dunesBalances = await getDuneBalances(wallet); // might be redundant, to refactor
  // convert value strings, to bigint representation

  let _limit = null;
  let _cap = null;
  if (limit) {
    _limit = nullNullOrEmpty(limit)
      ? null
      : removeDecimal(padWithZeros(limit, divisibility));
  }

  if (cap) {
    _cap = nullNullOrEmpty(cap)
      ? null
      : removeDecimal(padWithZeros(cap, divisibility));
  }

  const _premine =
    nullNullOrEmpty(premine) || premine === '0'
      ? '0'
      : removeDecimal(padWithZeros(premine, divisibility));

  const res = await _getOpenDuneTx(
    wallet,
    blockCount,
    dunesBalances,
    tick,
    symbol,
    _limit,
    divisibility,
    _cap,
    heightStart,
    heightEnd,
    offsetStart,
    offsetEnd,
    _premine,
    String(turbo),
    String(openMint),
    doggyfiFee,
    doggyfiAddress,
  );

  return [res.tx, res.fees];
}

/**
 * Mint a dune (if it is open to mint) and send it to the receiver.
 *
 * @param wallet - The wallet to use.
 * @param id - The id of the dune to mint.
 * @param _amount - The amount to mint.
 * @param receiver - The receiver of the dune.
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @returns The transaction and the fees.
 */
export async function mintDuneTx(
  wallet: Wallet,
  id: string,
  _amount: string,
  receiver: string,
  doggyfiFee: number,
  doggyfiAddress: string,
): Promise<[string, number]> {
  const duneData = await fetchDuneInfo(id); // check if output has changed
  if (duneData === null) {
    throw new Error(`Could not fetch dune info for dune/id ${id}`);
  }
  // if there are less decimals than what the dune requires, pad with 0s
  const finalAmount = moveDecimalToRight(
    padWithZeros(_amount, duneData.divisibility),
  );
  let mintCap: bigint | null;
  if (duneData.terms.amount_per_mint) {
    mintCap = moveDecimalToRight(String(duneData.terms.amount_per_mint));
  } else {
    mintCap = null;
  }

  // if there is a mint cap, check if the amount is within the cap
  if (mintCap) {
    if (finalAmount > mintCap) {
      throw new Error('Mint amount exceeds mint cap');
    }
  }

  const res = await _mintDuneTx(
    wallet,
    id,
    finalAmount.toString(),
    receiver,
    doggyfiFee,
    doggyfiAddress,
  );

  return [res.tx, res.fees];
}

/**
 * Splits multiple dunes into new different outputs on a single transaction.
 *
 * @param wallet - An Apezord wallet.
 * @param dune - The dune to split.
 * @param addresses - The addresses to send the dunes to.
 * @param amounts - The amounts to send the dunes to.
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @param _duneID - The dune id.
 * @param _duneUtxosMap - The dune utxos map.
 * @returns The transaction and the fees.
 */
export async function splitDunesUtxosTX(
  wallet: Wallet,
  dune: string,
  addresses: string[],
  amounts: string[],
  doggyfiFee: number,
  doggyfiAddress: string,
  _duneID: string | null = null,
  _duneUtxosMap: {
    specificDunes: DuneBalance[];
    utxos: APEUTXO[];
    totalAmount: bigint;
  } | null = null,
): Promise<[string, number]> {
  // get Dunes UTXOs out of the wallet;
  let duneUtxos: APEUTXO[];
  // we use the if statement to check if the user has provided the utxos
  // the saves costs of calling extractDuneUtxos (particularly when send calls it)
  if (_duneUtxosMap === null) {
    const _ = await extractDuneUtxos(wallet, amounts, dune, true);
    if (_ === null) {
      throw new Error('Could not find enough dune utxos');
    }
    duneUtxos = _.duneUtxos;
  } else {
    duneUtxos = _duneUtxosMap.utxos;
  }

  // if you know dune id, this is a lot safer
  // but user shouldn't need to know it if they are not super technical
  // by default, we will use the dune id from the getDune method
  let duneID: string | null = _duneID;
  const resp = await fetchDuneInfo(dune);
  if (resp === null) {
    throw new Error('Could not fetch dune info');
  }

  if (duneID === null) {
    duneID = resp.id;
  }
  // need to pass in the string representation of the amounts, pad the decimals with 0s
  const _amounts = [];
  for (const amount of amounts) {
    _amounts.push(
      decimalToBigInt(amount, Number(resp.divisibility)).toString(),
    );
  }
  const res = await _splitDunesUtxosTx(
    wallet,
    addresses,
    duneID,
    duneUtxos,
    _amounts,
    doggyfiFee,
    doggyfiAddress,
  );

  return [res.tx, res.fees];
}

/**
 * Sends a dune to an address.
 *
 * @param wallet - An Apezord wallet.
 * @param address - The address to send the dune to.
 * @param amount - The amount to send.
 * @param dune - The dune to send.
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @returns The transaction and the fees.
 */
export async function sendDuneTx(
  wallet: Wallet,
  address: string,
  amount: string,
  dune: string,
  doggyfiFee: number,
  doggyfiAddress: string,
): Promise<[string, number]> {
  const _ = await extractDuneUtxos(wallet, [amount], dune, true);

  if (_ === null) {
    throw new Error(
      `Insufficient dune balance found for dune ${dune} with amount ${amount}`,
    );
  }
  const utxos = _.duneUtxos;
  const totalDuneBalance = _.totalAmount;

  let tx: string;
  let fees: number;
  if (utxos.length === 1 && totalDuneBalance === amount) {
    // Need to make splits
    const resp = await fetchDuneInfo(dune);
    if (resp === null) {
      throw new Error('Could not fetch dune info');
    }
    const res = _sendExactDuneTx(
      wallet,
      address,
      utxos[0],
      doggyfiFee,
      doggyfiAddress,
    );
    tx = res.tx;
    fees = res.fees;
  } else {
    // Need to make splits
    const res = await splitDunesUtxosTX(
      wallet,
      dune,
      [address],
      [amount],
      doggyfiFee,
      doggyfiAddress,
    );
    tx = res[0];
    fees = res[1];
  }

  return [tx, fees];
}

/**
 * Moves decimal to right and returns a bigint.
 *
 * @param value - The value to be moved.
 * @returns Returns a bigint.
 */
export function moveDecimalToRight(value: string): bigint {
  // 1. Remove the decimal point by splitting on it
  const [integerPart, fractionalPart] = value.split('.');

  // 2. Combine the integer and fractional parts into a single string
  const combined = integerPart + (fractionalPart || '');

  // 3. Convert the result into a BigInt
  return BigInt(combined);
}

/**
 * Pads with strings of 0s to the right based on the divisibility.
 *
 * @param amount - The value to be padded.
 * @param divisibility - The divisibility of the value.
 * @returns The padded value.
 */
function padWithZeros(amount: string, divisibility: number): string {
  let numDigits = 0;
  if (amount.includes('.')) {
    numDigits = amount.split('.')[1].length;
  }
  // if there are more digits than the divisibility, throw an error

  if (numDigits > divisibility) {
    throw new Error(
      `Amount has more digits after the '.' than the dune allows. Amount: ${amount}, dune divisibility: ${divisibility}`,
    );
  }
  let _amount = amount;
  for (let i = 0; i < divisibility - numDigits; i++) {
    _amount += '0';
  }

  return _amount;
}

/**
 * Rip out "." from the amount.
 *
 * @param amount - The amount as string to be ripped out.
 * @returns The amount without the ".".
 */
function removeDecimal(amount: string): string {
  if (amount.length <= 0) {
    throw new Error('Amount must be a non-empty string');
  }
  const _ = amount.split('.');
  if (_.length <= 1) {
    return amount;
  }
  return _[0] + _[1];
}

/**
 * Check if a string is null, undefined, or empty.
 *
 * @param str - The string to check.
 * @returns Boolean indicating if the string is null, undefined, or empty.
 */
function nullNullOrEmpty(str: string | null | undefined): boolean {
  if (str === null || str === undefined) {
    return true;
  }
  return str.length === 0;
}
