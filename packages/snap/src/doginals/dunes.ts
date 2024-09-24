// typescipt methods for managing dunes assets
import { _getOpenDuneTx } from './dunesMethods/openDuneTx';
import { _splitDuneTx, _splitDunesUtxosTx } from './dunesMethods/splitDunesTx';
import { _mintDuneTx } from './dunesMethods/mintDunesTx';
import { _sendExactDuneTx } from './dunesMethods/sendExactDuneTx';
import { Wallet, APEUTXO } from './makeApezordWallet';
import { getBlockCount } from '../queries';
import { extractDuneUtxos } from './dunesMethods/extractDuneUtxo';
import { getDuneBalances, DuneBalance } from './dunesMethods/getDunesBalances';
import { fetchDuneInfo } from '../doggyfi-apis/dunesInfo';
import { bigint } from '../../dist/bundle';

/**
 * Checks which utxos don't have dunes based on a list of dunes for the wallet.
 * @param wallet
 * @param dunes
 * @param assume100kShibe
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
  let utxos = wallet.utxos;
  let safeUtxos: APEUTXO[] = [];
  for (const utxo of utxos) {
    if (utxo.dunes.length === 0) {
      safeUtxos.push(utxo);
    }
  }
  return safeUtxos;
}

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
  const res = await _getOpenDuneTx(
    wallet,
    blockCount,
    dunesBalances,
    tick,
    symbol,
    limit,
    divisibility,
    cap,
    heightStart,
    heightEnd,
    offsetStart,
    offsetEnd,
    premine,
    String(turbo),
    String(openMint),
    doggyfiFee,
    doggyfiAddress,
  );

  return [res['tx'], res['fees']];
}

// TODO: write fetch divisibility and limit into card to make it easier to use for end user
export async function mintDuneTx(
  wallet: Wallet,
  id: string,
  _amount: string,
  receiver: string,
  doggyfiFee: number,
  doggyfiAddress: string,
  mintAll: boolean = false,
): Promise<[string, number]> {
  const duneData = await fetchDuneInfo(id);
  if (duneData === null) {
    throw new Error('Could not fetch dune info for dune/id ' + id);
  }

  // check that the dune is open to mint
  const bigInt10 = BigInt(10);
  const bigIntDecimals = BigInt(duneData.divisibility);
  const bigIntScaler = bigInt10 ** bigIntDecimals;
  let amount: string;
  if (mintAll) {
    if (
      duneData.terms.amount_per_mint &&
      BigInt(duneData.terms.amount_per_mint) > 0 &&
      duneData.divisibility !== undefined &&
      Number(duneData.divisibility) > 0
    ) {
      if (
        duneData.terms.amount_per_mint !== undefined &&
        duneData.terms.amount_per_mint !== null &&
        BigInt(duneData.terms.amount_per_mint) > BigInt(0)
      ) {
        amount = (BigInt(duneData.terms.amount_per_mint) *
            bigIntScaler).toString();
      } else if (
        duneData.terms.mint_txs_cap !== null &&
        BigInt(duneData.terms.mint_txs_cap) > BigInt(0)
      ) {
        amount = (BigInt(duneData.terms.mint_txs_cap) * bigIntScaler).toString();
      } else {
        throw new Error('No specified limit or cap');
      }
    } else {
      throw new Error('Could not fetch dune data');
    }
  } else {
    // see if their is a mint limit
    if (duneData.terms.amount_per_mint !== null) {
      if (BigInt(_amount) > BigInt(duneData.terms.amount_per_mint)) {
        throw new Error('Mint amount exceeds mint cap');
      }
    }
    amount = _amount;
  }

  const dunesBalances = await getDuneBalances(wallet);

  const res = await _mintDuneTx(wallet, id, amount, receiver, dunesBalances, doggyfiFee, doggyfiAddress);

  return [res['tx'], res['fees']];
}

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
  let totalDuneBalance: bigint = BigInt(0);
  // we use the if statement to check if the user has provided the utxos
  // the saves costs of calling extractDuneUtxos (particularly when send calls it)
  if (_duneUtxosMap === null) {
    const _ = await extractDuneUtxos(wallet, amounts, dune, true);
    if (_ === null) {
      throw new Error('Could not find enough dune utxos');
    }
    duneUtxos = _.duneUtxos;
    totalDuneBalance = BigInt(_.totalAmount);
  } else {
    duneUtxos = _duneUtxosMap.utxos;
    totalDuneBalance = _duneUtxosMap.totalAmount;
  }

  // if you know dune id, this is a lot safer
  // but user shouldn't need to know it if they are not super technical
  // by default, we will use the dune id from the getDune method
  let duneID: string | null = null;
  if (duneID === null) {
    const resp = await fetchDuneInfo(dune);
    if (resp === null) {
      throw new Error('Could not fetch dune info');
    }
    duneID = resp.id;
  } else {
    duneID = duneID;
  }

  const res = await _splitDunesUtxosTx(
    wallet,
    addresses,
    duneID,
    duneUtxos,
    amounts,
    doggyfiFee,
    doggyfiAddress,
  );

  return [res['tx'], res['fees']];
}

/**
 * Sends a dune to an address.
 *
 * @param wallet
 * @param address
 * @param amount
 * @param dune
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
  const duneBalances = await getDuneBalances(wallet);
  //throw new Error ("Got dune balances");
  const _ = await extractDuneUtxos(wallet, [amount], dune, true);

  if (_ === null) {
    throw new Error(
      `Insufficient dune balance found for dune ${dune} with amount ${amount}`,
    );
  }
  // let specificDunesDogeOrd = _.specificDunes;
  let utxos = _.duneUtxos;
  let totalDuneBalance = _.totalAmount;

  let tx: string;
  let fees: number;
  if (utxos.length == 1 && totalDuneBalance === amount) {
    // Need to make splits
    const resp = await fetchDuneInfo(dune);
    if (resp === null) {
      throw new Error('Could not fetch dune info');
    }
    const duneID = resp.id;
    const res = await _sendExactDuneTx(wallet, address, utxos[0], doggyfiFee, doggyfiAddress);
    tx = res['tx'];
    fees = res['fees'];
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
