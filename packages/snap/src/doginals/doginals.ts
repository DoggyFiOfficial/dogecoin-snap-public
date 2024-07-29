// Flat file refactoring doginals.js in typescript
import { getDogeOrdUnspents as getUTXOs } from '../dogeord/dogeordUnspents';
import {
  makeMintInscription,
  makeTransferInscription,
  makeDeployInscription,
} from './inscribeMethods';
import { inscribe } from './inscribe';
import { createWallet, UTXO, Wallet } from './makeApezordWallet';

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
async function makeWalletFromDogeOrd(
  privkey: string,
  address: string,
  filterDust = true,
): Promise<Wallet> {
  const dogeordunspents = await getUTXOs(address);

  // remap dogeord unspent outputs to UTXOs from makeApezordWallet
  const utxos: UTXO[] = [];
  for (const dogeordunspent of dogeordunspents) {
    const _value = Number(dogeordunspent.value);
    if (filterDust && _value <= 100_000) {
      continue; // risk of being an inscription
    }
    const _txid = dogeordunspent.tx_hash;
    const _vout = Number(dogeordunspent.tx_output_n);
    const _script = dogeordunspent.script;
    utxos.push({
      txid: _txid,
      vout: _vout,
      satoshis: _value,
      script: _script,
    });
  }

  // make an apzord wallet
  return createWallet(privkey, address, utxos);
}

/**
 * Mint a drc20 token.
 *
 * @param privateKey - The private key.
 * @param address - The doge address.
 * @param ticker - A drc20 ticker.
 * @param amount - The amount to mint.
 * @returns A promise of a tuple of the serialized transaction and the total fees.
 */
export async function mintDrc20(
  privateKey: string,
  address: string,
  ticker: string,
  amount: number,
): Promise<[string[], number]> {
  // check if ticker is 4 characters...
  if (ticker.length !== 4) {
    throw new Error('ticker must be 4 characters');
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
  const res = inscribe(wallet, address, DRC20_CONTENT_TYPE, data);

  return [res.serialized, res.totalFees];
}

/**
 * Transfer a drc20 token.
 *
 * @param privateKey - The private key.
 * @param fromAddress - The doge address.
 * @param ticker - A drc20 ticker.
 * @param amount - The amount to transfer.
 * @returns A promise of a tuple of the serialized transaction and the total fees.
 */
export async function transferDrc20(
  privateKey: string,
  fromAddress: string,
  ticker: string,
  amount: number,
): Promise<[string[], number]> {
  // check if ticker is 4 characters...
  if (ticker.length !== 4) {
    throw new Error('ticker must be 4 characters');
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
  const res = inscribe(wallet, fromAddress, DRC20_CONTENT_TYPE, data);

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
 * @returns A promise that resolves to a tuple containing the serialized transaction and the total fees.
 */
export async function mintDeploy(
  privateKey: string,
  address: string,
  ticker: string,
  max: number,
  lim: number | null | undefined,
  dec: number | null | undefined,
): Promise<[string[], number]> {
  // make sure contentType is valid
  if (!VALID_CONTENT_TYPES.includes(DRC20_CONTENT_TYPE)) {
    throw new Error('invalid content type');
  }

  // check if ticker is 4 characters...
  if (ticker.length !== 4) {
    throw new Error('ticker must be 4 characters');
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
    throw new Error('data must be hex');
  }
  const data = Buffer.from(argHexData, 'hex');

  if (data.length === 0) {
    throw new Error('no data to mint');
  }

  const wallet = await makeWalletFromDogeOrd(privateKey, address);
  const res = inscribe(wallet, address, DRC20_CONTENT_TYPE, data);

  return [res.serialized, res.totalFees];
}
