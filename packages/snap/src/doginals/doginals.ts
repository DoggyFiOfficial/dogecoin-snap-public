// Flat file refactoring doginals.js in typescript
import { fetchUTXOs } from '../doggyfi-apis/unspents';
import {
  makeMintInscription,
  makeTransferInscription,
  makeDeployInscription,
} from './inscribeMethods';
import { inscribe } from './inscribe';
import { createWallet, Wallet, APEUTXO } from './makeApezordWallet';

const VALID_CONTENT_TYPES = ['text/plain;charset=utf-8', 'image/jpeg'];
const DRC20_CONTENT_TYPE = 'text/plain;charset=utf-8';

/**
 * Make a wallet from a dogeord address.
 *
 * @param privkey - The private key.
 * @param address - The doge address.
 * @param filterDust - Whether to filter dust.
 * @returns Wallet matching apezord schema.
 */
export async function makeWalletFromDogeOrd(
  privkey: string,
  address: string,
  filterDust = true,
): Promise<Wallet> {
  const resp = await fetchUTXOs(address);
  if (resp === null) {
    throw new Error('Could not fetch utxos');
  }

  // remap dogeord unspent outputs to UTXOs from makeApezordWallet
  const apeutxos: APEUTXO[] = [];
  for (const unspent of resp.unspents) {
    const _value = Number(unspent.value);
    if (filterDust && _value <= 100_000) {
      continue; // risk of being an inscription
    }
    const _txid = unspent.hash;
    const _vout = Number(unspent.vout_index);
    apeutxos.push({
      txid: _txid,
      vout: _vout,
      satoshis: _value,
      dunes: unspent.dunes,
      inscriptions: unspent.inscriptions,
      script: unspent.scriptPubKey,
    });
  }
  // make an apzord wallet
  return createWallet(privkey, address, apeutxos);
}

/**
 * Inscribe data.
 *
 * @param privateKey - The private key.
 * @param address - The doge address.
 * @param data - The data to inscribe, as a hex string.
 * @param contentType - The content type of the data (e.g., plain/text).
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @returns A promise of a tuple of the serialized transaction and the total fees.
 */
export async function inscribeData(
  privateKey: string,
  address: string,
  data: string,
  contentType: string,
  doggyfiFee: number,
  doggyfiAddress: string,
): Promise<[string[], number]> {
  const dataBuffer = Buffer.from(data, 'hex');
  const wallet = await makeWalletFromDogeOrd(privateKey, address);
  const res = inscribe(
    wallet,
    address,
    contentType,
    dataBuffer,
    doggyfiFee,
    doggyfiAddress,
  );

  return [res.serialized, res.totalFees];
}

/**
 * Mint a drc20 token.
 *
 * @param privateKey - The private key.
 * @param address - The doge address.
 * @param ticker - A drc20 ticker.
 * @param amount - The amount to mint.
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @returns A promise of a tuple of the serialized transaction and the total fees.
 */
export async function mintDrc20(
  privateKey: string,
  address: string,
  ticker: string,
  amount: number,
  doggyfiFee: number,
  doggyfiAddress: string,
): Promise<[string[], number]> {
  // check if ticker is between 1 to 4 characters...
  if (ticker.length < 1 || ticker.length > 4) {
    throw new Error(
      `ticker must be at least 1 but no more than 4 characters, got length ${ticker.length}`,
    );
  }

  // check if amount > 0
  if (amount <= 0) {
    throw new Error('amount must be greater than 0');
  }

  // check contentType is valide
  if (!VALID_CONTENT_TYPES.includes(DRC20_CONTENT_TYPE)) {
    throw new Error('invalid content type');
  }

  const argHexData = makeMintInscription('drc-20', ticker, String(amount));
  const data = Buffer.from(argHexData, 'hex');

  // make an apzord wallet
  const wallet = await makeWalletFromDogeOrd(privateKey, address);
  const res = inscribe(
    wallet,
    address,
    DRC20_CONTENT_TYPE,
    data,
    doggyfiFee,
    doggyfiAddress,
  );

  return [res.serialized, res.totalFees];
}

/**
 * Transfer a drc20 token.
 *
 * @param privateKey - The private key.
 * @param fromAddress - The doge address.
 * @param ticker - A drc20 ticker.
 * @param amount - The amount to transfer.
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @returns A promise of a tuple of the serialized transaction and the total fees.
 */
export async function transferDrc20(
  privateKey: string,
  fromAddress: string,
  ticker: string,
  amount: number,
  doggyfiFee: number,
  doggyfiAddress: string,
): Promise<[string[], number]> {
  // check if ticker is 4 characters...
  if (ticker.length < 1 || ticker.length > 4) {
    throw new Error(
      `ticker must be at least 1 but no more than 4 characters, got length ${ticker.length}`,
    );
  }

  // check if amount > 0
  if (amount <= 0) {
    throw new Error('amount must be greater than 0');
  }

  // check contentType is valide
  if (!VALID_CONTENT_TYPES.includes(DRC20_CONTENT_TYPE)) {
    throw new Error('invalid content type');
  }

  const argHexData = makeTransferInscription('drc-20', ticker, String(amount));
  const data = Buffer.from(argHexData, 'hex');

  const wallet = await makeWalletFromDogeOrd(privateKey, fromAddress);
  const res = inscribe(
    wallet,
    fromAddress,
    DRC20_CONTENT_TYPE,
    data,
    doggyfiFee,
    doggyfiAddress,
  );

  return [res.serialized, res.totalFees];
}

/**
 * Deploys a DRC20 token.
 *
 * @param privateKey - The private key.
 * @param address - The Dogecoin address.
 * @param ticker - The DRC20 ticker.
 * @param max - The maximum amount to mint.
 * @param lim - The minting limit.
 * @param dec - The number of decimal places.
 * @param doggyfiFee - The doggyfi fee.
 * @param doggyfiAddress - The doggyfi address.
 * @returns A promise that resolves to a tuple containing the serialized transaction and the total fees.
 */
export async function mintDeploy(
  privateKey: string,
  address: string,
  ticker: string,
  max: number,
  lim: number | null | undefined,
  dec: number | null | undefined,
  doggyfiFee: number,
  doggyfiAddress: string,
): Promise<[string[], number]> {
  // make sure contentType is valid
  if (!VALID_CONTENT_TYPES.includes(DRC20_CONTENT_TYPE)) {
    throw new Error('invalid content type');
  }

  // check if ticker is 4 characters...
  if (ticker.length < 1 || ticker.length > 4) {
    throw new Error(
      `ticker must be at least 1 but no more than 4 characters, got length ${ticker.length}`,
    );
  }

  // check if max > 0
  if (max <= 0) {
    throw new Error('max must be greater than 0');
  }

  // lim is optional, but if provided, must be > 0
  if (lim && lim <= 0) {
    throw new Error('lim must be greater than 0');
  }

  // dec is optional, but if provided, must be > 0
  if (dec && dec <= 0) {
    throw new Error('dec must be greater than 0');
  }

  const stringLim = lim ? String(lim) : null;
  const stringDec = dec ? String(dec) : null;
  const argHexData = makeDeployInscription(
    'drc-20',
    ticker,
    String(max),
    stringLim,
    stringDec,
  );

  if (!/^[a-fA-F0-9]*$/.test(argHexData)) {
    // eslint-disable-line
    throw new Error('data must be hex');
  }
  const data = Buffer.from(argHexData, 'hex');

  if (data.length === 0) {
    throw new Error('no data to mint');
  }

  const wallet = await makeWalletFromDogeOrd(privateKey, address);
  const res = inscribe(
    wallet,
    address,
    DRC20_CONTENT_TYPE,
    data,
    doggyfiFee,
    doggyfiAddress,
  );

  return [res.serialized, res.totalFees];
}
