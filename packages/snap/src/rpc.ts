import * as bitcoin from 'bitcoinjs-lib';
import * as bitcoinMessage from 'bitcoinjs-message';
// @ts-expect-error No types exist
import coininfo from 'coininfo';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import { SATOSHI_TO_DOGE } from './constants';
import { getAccount } from './private-key';
import {
  MakeTransactionParams,
  MintDrc20Params,
  InscribeTransferDrc20Params,
  sendDrc20Params,
  DeployDrc20Params,
  SendDoginalParams,
  addressParams,
  signPsbtParams,
  pushPsbtParams,
  signMessageParams,
  verifyMessageParams,
  inscribeDataParams,
  openDuneTxParams,
  mintDuneTxParams,
  splitDuneTxParams,
  sendDuneParams,
  GetDuneBalancesParams,
  GetDuneMetadataParams,
  Drc20InfoParams,
} from './types';
import {
  mintDeploy,
  mintDrc20 as _mintDrc20,
  inscribeData as _inscribeData,
  transferDrc20,
  makeWalletFromDogeOrd,
} from './doginals/doginals';
import {
  openDuneTx as _openDuneTx,
  mintDuneTx as _mintDuneTx,
  sendDuneTx,
  splitDunesUtxosTX,
} from './doginals/dunes';
import { getSatRange } from './find-ord-index';
import { makeTransferInscription } from './doginals/inscribeMethods';
import {
  getDuneBalances,
  type DuneBalance,
} from './doginals/dunesMethods/getDunesBalances';
import {
  DuneInfo,
  TxInfoResponse,
  Drc20BalData,
  Drc20Info,
} from './doggyfi-apis/interfaces';
import { fetchDuneInfo } from './doggyfi-apis/dunesInfo';
import { fetchUTXOs } from './doggyfi-apis/unspents';
import { fetchTxInfo } from './doggyfi-apis/getTxInfo';
import { pushTransaction } from './doggyfi-apis/pushTransaction';
import { getFeeRate } from './doggyfi-apis/getFeeRate';
import { getUtxosForValue } from './getUtxosForValue';
import { drc20BalByAddress } from './doggyfi-apis/drc20ByAddress';
import { getDrc20Info as _getDrc20Info } from './doggyfi-apis/drc20Info';
import { getTipRate } from './doggyfi-apis/tipRate';

const dogecoinFormat = coininfo.dogecoin.main.toBitcoinJS();
const dogecoinNetwork = {
  messagePrefix: `\x19${dogecoinFormat.name} Signed Message:\n`,
  bech32: '',
  bip32: {
    public: dogecoinFormat.bip32.public,
    private: dogecoinFormat.bip32.private,
  },
  pubKeyHash: dogecoinFormat.pubKeyHash,
  scriptHash: dogecoinFormat.scriptHash,
  wif: dogecoinFormat.wif,
};

/**
 * Get the address for the given address index.
 *
 * @param params - The parameters for getting the address.
 */
export const getAddress = async (params: addressParams): Promise<string> => {
  const account = await getAccount(params.addressIndex);

  const { address } = bitcoin.payments.p2pkh({
    pubkey: Buffer.from(account.compressedPublicKeyBytes),
    network: dogecoinNetwork,
  });

  if (!address) {
    throw new Error('->Address not found in getAddress function');
  }

  return address;
};

export const getTransactions = async (
  params: addressParams,
): Promise<TxInfoResponse[]> => {
  // fetch utxos for the address
  const utxosResp = await fetchUTXOs(await getAddress(params));
  if (utxosResp === null) {
    throw new Error('Could not fetch utxos');
  }
  // for each txid, fetch the tx details
  const transactions: TxInfoResponse[] = [];
  for (const utxo of utxosResp.unspents) {
    const txDetailsResponse = await fetchTxInfo(utxo.hash);
    if (!txDetailsResponse) {
      throw new Error('Could not fetch transaction details');
    }
    const txDetails = txDetailsResponse;
    transactions.push({
      txid: txDetails.txid, // this is the txid
      hex: txDetails.hex, // this is the hex
      size: txDetails.size,
      vsize: txDetails.vsize,
      vin: txDetails.vin,
      vout: txDetails.vout,
      blockhash: txDetails.blockhash,
      confirmations: txDetails.confirmations,
      time: txDetails.time,
      blocktime: txDetails.blocktime,
    });
  }
  return transactions;
};

/**
 * Get the balance for the given address index.
 *
 * @param params - The parameters for getting the balance.
 * @returns The balance of the address.
 */
export const getBalance = async (params: addressParams): Promise<number> => {
  const myAddress = await getAddress(params);
  // fetch unspents for the address
  const utxosResp = await fetchUTXOs(myAddress);
  if (utxosResp === null) {
    console.log('UTXO response is null, returning 0');
    return 0;
  }
  // calculate the balance by summing the values of the unspents
  let balance = 0;
  // reduce for balance
  utxosResp.unspents.reduce((acc, unspent) => {
    balance += Number(unspent.value);
    return acc + balance;
  }, 0);

  return balance / 100_000_000;
};

/**
 * Inscribes arbitrary data onto the blockchain.
 *
 * @param params - The parameters for inscribing data.
 * @returns The transaction hash and other relevant information.
 */
export const inscribeData = async (
  params: inscribeDataParams,
): Promise<[string, string]> => {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }
  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const doggyfiFee = await getTipRate();
  if (doggyfiFee === null) {
    throw new Error('Could not fetch tip rate');
  }

  const [txs, fees] = await _inscribeData(
    privkey,
    myAddress,
    params.data,
    Number(doggyfiFee.tip),
    doggyfiFee.tipAddress,
  );

  // ask user to confirm fee
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(`Inscribing this data will cost you the following in DOGE`),
        copyable((fees / 100_000_000).toString()),
        text('Please confirm this is OK to continue...'),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  // broadcast commit
  const commitResponse = await pushTransaction(txs[0]);
  if (commitResponse === null) {
    throw new Error('Could not broadcast commit');
  }
  // broadcast reveal
  const revealResponse = await pushTransaction(txs[1]);
  if (!revealResponse) {
    throw new Error('Could not broadcast reveal');
  }

  return [commitResponse.txid, revealResponse.txid];
};

/**
 * Create a Dogecoin P2PKH transaction and broadcast it over the network.
 *
 * The steps are:
 * - Present a dialog for the user to confirm the transaction. This is
 * - Find enough UTXOs to cover the transfer.
 * - Create the transaction inputs.
 * - Create the transaction outputs, taking into account fees.
 * - Sign the transaction.
 * - Broadcast the transaction.
 *
 * @param transactionParams - The transaction parameters.
 * @param transactionParams.toAddress - The destination address.
 * @param transactionParams.amountInSatoshi - The amount to send, in "satoshis" i.e. DOGE * 100_000_000.
 * @param transactionParams.addressIndex - The index of the address to use.
 */
export const makeTransaction = async ({
  addressIndex,
  toAddress,
  amountInSatoshi,
}: MakeTransactionParams): Promise<string> => {
  const amountInDoge = amountInSatoshi / SATOSHI_TO_DOGE;
  let confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text('Send the following amount in DOGE:'),
        copyable(amountInDoge.toString()),
        text('To the following address:'),
        copyable(toAddress),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Transaction must be approved by user');
  }

  const psbt = new bitcoin.Psbt({
    network: dogecoinNetwork,
  });

  const account = await getAccount(addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({ addressIndex });
  const utxosResp = await fetchUTXOs(myAddress);
  if (utxosResp === null) {
    throw new Error('Could not fetch utxos');
  }
  const allUtxos = utxosResp.unspents;
  // filter out any utxos with inscriptions or dunes, and enough value
  const utxos = await getUtxosForValue(
    allUtxos.filter((utxo) => {
      return utxo.inscriptions.length === 0 && utxo.dunes.length === 0;
    }),
    amountInSatoshi,
  );

  if (utxos.length === 0) {
    throw new Error('No unspents for address');
  }
  const feesResp = await getFeeRate();
  if (feesResp === null) {
    throw new Error('Could not fetch fee rate');
  }
  const feePerByte = feesResp;

  await Promise.all(
    utxos.map(async (utxo) => {
      let txHex;
      try {
        const txResp = await fetchTxInfo(utxo.hash);
        if (txResp === null) {
          throw new Error('Could not fetch transaction details');
        }
        txHex = txResp.hex;
      } catch (err: any) {
        const msg = `error while getting transaction hex${err} ${utxo.hash}`;
        throw new Error(msg);
      }

      psbt.addInput({
        // @ts-expect-error this actually works fine, eslint resolving the type wrong...
        hash: utxo.hash,
        index: utxo.vout_index, // note this typing is specific to dogeord responses...
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });
    }),
  );

  const numInputs = psbt.inputCount;
  const numOutputs = psbt.txOutputs.length + 3;
  const size = 10 + numInputs * 148 + numOutputs * 34;
  const fee = size * Math.max(feePerByte || 100_000, 50_000);

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }

  const totalUtxoValue = utxos.reduce(
    (total, curr) => total + Number(curr.value), // Note dogeord unspents you don't need to multiply (might change with another api?)
    0,
  );

  const changeValue = Math.floor(totalUtxoValue - amountInSatoshi - fee);

  if (changeValue < 0) {
    throw new Error('Must have enough funds for transaction + fees');
  }

  psbt.addOutput({
    address: toAddress,
    value: amountInSatoshi,
  });

  psbt.addOutput({
    address: myAddress,
    value: changeValue,
  });

  psbt.addOutput({
    address: tip.tipAddress,
    value: Number(tip.tip),
  });

  // before sigining, confirm with user that they are okay with all fees..
  confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(
          `Sending this transaction will cost you the following in DOGE for network fees`,
        ),
        copyable((fee / 100_000_000).toString()),
        text('And doggyfi will additional charge the following in DOGE'),
        text('These will be added to the total cost of the transaction'),
        copyable((Number(tip.tip) / 100_000_000).toString()),
        text(
          'Please confirm this is OK to sign and broadcast the transaction...',
        ),
      ]),
    },
  });

  psbt.signAllInputs(
    bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes)),
  );
  const txHex = psbt.finalizeAllInputs().extractTransaction(true).toHex();
  const txResponse = await pushTransaction(txHex);
  if (txResponse === null) {
    throw new Error('Could not push transaction');
  }
  return txResponse.txid;
};

/**
 * Signs a PSBT with the selected private key.
 *
 * @param params - The parameters for signing the PSBT.
 * @param params.addressIndex - The address index to use.
 * @param params.psbt - The PSBT to sign.
 * @returns The signed PSBT as a hex string.
 */
export async function signPsbt(params: signPsbtParams): Promise<string> {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  // ask the snap to confirm the signing, give the user a chance to review the transaction
  // this means giving them the hex
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text('You are signing the following tx:'),
        copyable(params.psbtHexString),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Signing must be approved by user');
  }

  const psbtCopy = bitcoin.Psbt.fromHex(params.psbtHexString, {
    network: dogecoinNetwork,
  });

  if (params.signIndices) {
    for (const i of params.signIndices) {
      psbtCopy.signInput(
        i,
        bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes)),
      );
    }
  } else {
    psbtCopy.signAllInputs(
      bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes)),
    );
  }

  return psbtCopy.toHex();
}

/**
 * Signs a Message with the selected private key.
 *
 * @param params - The parameters for signing.
 * @param params.addressIndex - The address index to use.
 * @param params.message - The message to sign.
 * @returns The signed message.
 */
export async function signMessage(params: signMessageParams): Promise<string> {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  // ask the snap to confirm the signing, give the user a chance to review the transaction
  // this means giving them the message
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm message'),
        divider(),
        text('You are signing the following message:'),
        copyable(params.message),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Signing must be approved by user');
  }

  const keyPair = bitcoin.ECPair.fromPrivateKey(
    Buffer.from(account.privateKeyBytes),
    {
      network: dogecoinNetwork,
    },
  );

  if (keyPair.privateKey === undefined) {
    throw new Error('Private key is required');
  }
  const signature = bitcoinMessage.sign(
    params.message,
    keyPair.privateKey,
    keyPair.compressed,
  );
  return signature.toString('base64');
}

/**
 * Verifies a message with the selected address.
 *
 * @param params - The parameters for the message verification.
 * @param params.addressIndex - The index of the address in use.
 * @param params.message - The message to be verified.
 * @param params.signature - The signature to verify.
 * @returns A promise of a boolean indicating if the message is verified.
 */
export async function verifyMessage(
  params: verifyMessageParams,
): Promise<boolean> {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  // ask user if they wish to confirm they can verify the message
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm message verification'),
        divider(),
        text('You are verifying the following message:'),
        copyable(params.message),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Verification must be approved by user');
  }
  const address = await getAddress({ addressIndex: params.addressIndex });
  const keyPair = bitcoin.ECPair.fromPrivateKey(
    Buffer.from(account.privateKeyBytes),
    {
      network: dogecoinNetwork,
    },
  );

  if (keyPair.publicKey === undefined) {
    throw new Error('Public key is required');
  }
  return bitcoinMessage.verify(
    params.message,
    address,
    Buffer.from(params.signature, 'base64'),
  );
}

/**
 * Pushes a signed PSBT to the network.
 *
 * @param params - A PushPsbtParams object containing the PSBT to push.
 * @returns A promise of the transaction hash.
 */
export async function pushPsbt(params: pushPsbtParams): Promise<string> {
  // ask the snap to confirm the signing, give the user a chance to review the transaction
  // give them a basic summary of the transaction
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text('You are posting the following tx:'),
        copyable(params.psbtHexString),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Transaction must be approved by user');
  }
  const psbt = bitcoin.Psbt.fromHex(params.psbtHexString, {
    network: dogecoinNetwork,
  });
  const txHex = psbt.finalizeAllInputs().extractTransaction(true).toHex();
  const txResponse = await pushTransaction(txHex);
  if (txResponse === null) {
    throw new Error('Could not push transaction');
  }
  return txResponse.txid;
}

/**
 * Derives a base58 private key string from a Buffer containing private key bytes.
 *
 * @param privateKeyBytes - Buffer containing private key bytes.
 * @returns The base58 private key string.
 */
function deriveBase58PrivateKey(privateKeyBytes: Uint8Array) {
  // Generate the keyPair
  const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKeyBytes), {
    network: dogecoinNetwork,
  });

  // Get the base58 private key string
  const wif = keyPair.toWIF();
  return wif;
}

/**
 * Mint a DRC20 token.
 *
 * @param params - The parameters for minting a DRC20 token.
 * @returns A promise of a tuple of the serialized transaction and the total fees.
 */
export async function mintDrc20(
  params: MintDrc20Params,
): Promise<[string, string]> {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }
  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }
  const [txs, fees] = await _mintDrc20(
    privkey,
    myAddress,
    params.ticker,
    params.amount,
    Number(tip.tip),
    tip.tipAddress,
  );

  // ask user to confirm fee
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(`Minting this DRC20 will cost you the following in DOGE`),
        copyable((fees / 100_000_000).toString()),
        text('Please confirm this is OK to continue...'),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  // broadcast commit
  const commitResponse = await pushTransaction(txs[0]);
  if (commitResponse === null) {
    throw new Error('Could not push transaction');
  }
  // broadcast reveal
  const revealResponse = await pushTransaction(txs[1]);
  if (revealResponse === null) {
    throw new Error('Could not push transaction');
  }

  return [commitResponse.txid, revealResponse.txid];
}

/**
 * Mint a DRC20 token and transfer it to another address.
 *
 * @param params - The parameters for minting and transferring a DRC20 token.
 */
export async function mintTransferDrc20(
  params: InscribeTransferDrc20Params,
): Promise<[string, string]> {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }
  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }
  const [txs, fees] = await transferDrc20(
    privkey,
    myAddress,
    params.ticker,
    params.amount,
    Number(tip.tip),
    tip.tipAddress,
  );
  // ask user to confirm fee
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(`Sending this DRC20 will cost you the following in DOGE`),
        copyable((fees / 100_000_000).toString()),
        text('Please confirm this is OK to continue...'),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  // broadcast commit
  const commitResponse = await pushTransaction(txs[0]);
  if (commitResponse === null) {
    throw new Error('Could not push transaction');
  }
  // broadcast reveal
  const revealResponse = await pushTransaction(txs[1]);
  if (revealResponse === null) {
    throw new Error('Could not push transaction');
  }
  return [commitResponse.txid, revealResponse.txid];
}

/**
 * Validates if a utxo is indeed a doginal.
 *
 * @param tx - The transaction to validate.
 * @returns True if the transaction is a doginal, false otherwise.
 */
export async function isDoginal(tx: TxInfoResponse) {
  const script = tx.vin[0].scriptSig.hex;
  const decompilied = bitcoin.script.decompile(Buffer.from(script, 'hex'));
  if (!decompilied) {
    return false;
  }
  const scriptSigString = decompilied
    .map((chunk) => {
      if (Buffer.isBuffer(chunk)) {
        return chunk.toString('hex');
      }
      return bitcoin.opcodes[chunk];
    })
    .join(' ');
  // check if it contains 'ord'
  if (scriptSigString.includes('ord')) {
    return true;
  }
  return false;
}

/**
 * Send a Dune.
 *
 * @param params - The parameters for sending a Dune.
 * @returns A promise of the transaction hash.
 */
export async function sendDune(params: sendDuneParams) {
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text(`Send the following dune:`),
        copyable(params.dune.toString()),
        text('In the amount of'),
        copyable(params.amount.toString()),
        text('To the following address:'),
        copyable(params.toAddress),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Transaction must be approved by user');
  }

  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const wallet = await makeWalletFromDogeOrd(privkey, myAddress, false);

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }

  const [tx, fees] = await sendDuneTx(
    wallet,
    params.toAddress,
    String(params.amount),
    params.dune,
    Number(tip.tip),
    tip.tipAddress,
  );

  // ask user to confirm fee
  const confirmationResponse2 = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(`Sending this Dune will cost you the following in DOGE`),
        copyable((fees / 100_000_000).toString()),
        text('And doggyfi will additional charge the following in DOGE'),
        text('These will be added to the total cost of the transaction'),
        copyable((Number(tip.tip) / 100_000_000).toString()),
        text('Please confirm this is OK to broadcast the transaction...'),
      ]),
    },
  });
  if (confirmationResponse2 !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  const txResponse = await pushTransaction(tx);
  if (txResponse === null) {
    throw new Error('Could not push transaction');
  }
  return txResponse.txid;
}

/**
 * Deploy an open Dune transaction.
 *
 * @param params - The parameters for deploying an open Dune transaction.
 * @returns A promise of the transaction hash.
 */
export async function openDune(params: openDuneTxParams) {
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text(
          `Deploying an open Dune transaction with the following parameters:`,
        ),
        text(`Ticker: ${params.tick}`),
        text(`Symbol: ${params.symbol}`),
        text(`Limit: ${params.limit}`),
        text(`Divisibility: ${params.divisibility}`),
        text(`Cap: ${params.cap}`),
        text(`Height Start: ${params.heightStart}`),
        text(`Height End: ${params.heightEnd}`),
        text(`Offset Start: ${params.offsetStart}`),
        text(`Offset End: ${params.offsetEnd}`),
        text(`Premine: ${params.premine}`),
        text(`Turbo: ${params.turbo}`),
        text(`Open Mint: ${params.openMint}`),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Transaction must be approved by user');
  }

  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const wallet = await makeWalletFromDogeOrd(privkey, myAddress);

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }
  const [tx, fees] = await _openDuneTx(
    wallet,
    params.tick,
    params.symbol,
    params.limit,
    params.divisibility,
    params.cap,
    params.heightStart,
    params.heightEnd,
    params.offsetStart,
    params.offsetEnd,
    params.premine,
    params.turbo,
    params.openMint,
    Number(tip.tip),
    tip.tipAddress,
  );

  // ask user to confirm fee
  const confirmationResponse2 = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(
          `Deploying this open Dune transaction will cost you the following in DOGE`,
        ),
        copyable((fees / 100_000_000).toString()),
        text('In addition to this, doggyfi will charge a fee of'),
        copyable((Number(tip.tip) / 100_000_000).toString()),
        text('Please confirm this is OK to broadcast the transaction...'),
      ]),
    },
  });
  if (confirmationResponse2 !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  const txResponse = await pushTransaction(tx);
  if (txResponse === null) {
    throw new Error('Could not push transaction');
  }
  return txResponse.txid;
}

/**
 * Mint a Dune transaction.
 *
 * @param params - The parameters for minting a Dune transaction.
 * @returns A promise of the transaction hash.
 */
export async function mintDune(params: mintDuneTxParams) {
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text(`Minting a Dune transaction with the following parameters:`),
        text(`ID: ${params.id}`),
        text(`Amount: ${params.amount}`),
        text(`Receiver: ${params.receiver}`),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Transaction must be approved by user');
  }

  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const wallet = await makeWalletFromDogeOrd(privkey, myAddress);

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }

  const [tx, fees] = await _mintDuneTx(
    wallet,
    params.id,
    params.amount,
    params.receiver,
    Number(tip.tip),
    tip.tipAddress,
  );

  // ask user to confirm fee
  const confirmationResponse2 = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(
          `Minting this Dune transaction will cost you the following in DOGE`,
        ),
        copyable((fees / 100_000_000).toString()),
        text('Doggyfi will in addition charge the following in DOGE'),
        text('These are already included in the fees quoted above'),
        copyable((Number(tip.tip) / 100_000_000).toString()),
        text('Please confirm this is OK to continue...'),
      ]),
    },
  });
  if (confirmationResponse2 !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  const txResponse = await pushTransaction(tx);
  if (txResponse === null) {
    throw new Error('Could not push transaction');
  }
  return txResponse.txid;
}

/**
 * Split a Dune transaction.
 *
 * @param params - The parameters for splitting a Dune transaction.
 * @returns A promise of the transaction hash.
 */
export async function splitDune(params: splitDuneTxParams) {
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text(`Splitting a Dune transaction with the following parameters:`),
        text(`Dunes: ${params.dune}`),
        text(`Amounts: ${params.amounts}`),
        text(`Receivers: ${params.addresses}`),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Transaction must be approved by user');
  }

  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const wallet = await makeWalletFromDogeOrd(privkey, myAddress);
  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }
  const [tx, fees] = await splitDunesUtxosTX(
    wallet,
    params.dune,
    params.addresses,
    params.amounts,
    Number(tip.tip),
    tip.tipAddress,
  );

  // ask user to confirm fee
  const confirmationResponse2 = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(
          `Splitting this Dune transaction will cost you the following in DOGE`,
        ),
        copyable((fees / 100_000_000).toString()),
        text('Please confirm this is OK to continue...'),
      ]),
    },
  });
  if (confirmationResponse2 !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  const txResponse = await pushTransaction(tx);
  if (txResponse === null) {
    throw new Error('Could not push transaction');
  }
  return txResponse.txid;
}

/**
 * Get dune balances for the account.
 *
 * @param params - The parameters for getting dune metadata.
 * @returns A promise of the dune metadata.
 */
export async function getDuneBalancesForAccount(
  params: GetDuneBalancesParams,
): Promise<{
  [key: string]: DuneBalance;
}> {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const wallet = await makeWalletFromDogeOrd(privkey, myAddress, false);
  const res = await getDuneBalances(wallet);
  return res;
}

/**
 * Get dune metadata for a dune.
 *
 * @param params - The parameters for getting dune metadata.
 * @returns A promise of the dune metadata.
 */
export async function getDuneMetadata(
  params: GetDuneMetadataParams,
): Promise<DuneInfo> {
  const id = params.duneId;
  const name = params.duneName;
  let resp: DuneInfo | null;

  if (id === undefined && name === undefined) {
    throw new Error('Must provide either duneId or duneName');
  } else if (id !== undefined) {
    resp = await fetchDuneInfo(id);
  } else if (name === undefined) {
    throw new Error(
      'Unexpected error getting dune metadata with provided params',
    );
  } else {
    resp = await fetchDuneInfo(name);
  }

  if (resp === null) {
    throw new Error('Could not fetch dune info');
  }
  return resp;
}

/**
 * Send Doginal.
 *
 * @param _params - The parameters for sending a doginal.
 * @param _skipInitialDialog - Whether to skip the initial dialog.
 * @param _tx - The transaction to use.
 * @returns A promise of the transaction hash.
 */
export async function sendDoginal(
  _params: SendDoginalParams,
  _skipInitialDialog = false,
  _tx: TxInfoResponse | undefined = undefined,
): Promise<string> {
  if (!_skipInitialDialog) {
    const confirmationResponse = await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'confirmation',
        content: panel([
          heading('Confirm transaction'),
          divider(),
          text(`Sending Doginal on following UTXO:`),
          copyable(_params.utxo),
          text('To the following address:'),
          copyable(_params.toAddress),
        ]),
      },
    });
    if (confirmationResponse !== true) {
      throw new Error('Transaction must be approved by user');
    }
  }
  const psbt = new bitcoin.Psbt({
    network: dogecoinNetwork,
  });

  const account = await getAccount(_params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({ addressIndex: _params.addressIndex });

  const txResp = await fetchTxInfo(_params.utxo);
  if (txResp === null) {
    throw new Error('Could not fetch transaction details');
  }

  // add doginal as 0th input
  psbt.addInput({
    // @ts-expect-error this actually works fine, eslint resolving the type wrong...
    hash: txResp.txid,
    index: _params.outputIndex || 0,
    nonWitnessUtxo: Buffer.from(txResp.hex, 'hex'),
  });

  // add inscription output
  psbt.addOutput({
    address: _params.toAddress,
    value: 100_000, // 100,000 shibes, this is the min amount
  });

  const feePerByte = await getFeeRate();
  if (feePerByte === null) {
    throw new Error('Could not fetch fee rate');
  }
  const numInputs = psbt.inputCount;
  const numOutputs = psbt.txOutputs.length + 3;
  const size = 10 + numInputs * 148 + numOutputs * 34;
  const fee = size * Math.max(feePerByte || 100_000, 50_000);

  // fetch the utxos to fund the fee
  const unspentsResp = await fetchUTXOs(myAddress);
  if (unspentsResp === null) {
    throw new Error('Could not fetch utxos');
  }
  const utxos = await getUtxosForValue(unspentsResp.unspents, fee);
  if (utxos.length === 0) {
    throw new Error('No unspents for address');
  }

  const totalUtxoValue = utxos.reduce(
    (total, curr) => total + Number(curr.value), // Note dogeord unspents you don't need to multiply (might change with another api?)
    0,
  );

  // add all of the utxos as inputs
  await Promise.all(
    utxos.map(async (iutxo) => {
      // if (utxo.tx_hash !== drc20_utxo.tx_hash) {
      let txHex: string | undefined;
      try {
        // get the txHex of the utxo
        txHex = (await fetchTxInfo(iutxo.hash))?.hex;
      } catch (err: any) {
        const msg = `error while getting transaction hex${err} ${txResp.txid}`;
        throw new Error(msg);
      }

      if (txHex === undefined) {
        throw new Error('Could not get txHex');
      }

      psbt.addInput({
        // @ts-expect-error this actually works fine, eslint resolving the type wrong...
        hash: iutxo.hash,
        index: iutxo.vout_index,
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });
    }),
  );

  // calculate change amount to return to sender
  const changeValue = Math.floor(totalUtxoValue - fee - 100_000);

  if (changeValue < 0) {
    throw new Error(
      `Must have enough funds for transaction + fees${changeValue}`,
    );
  }

  // add change output
  psbt.addOutput({
    address: myAddress,
    value: changeValue,
  });

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }

  psbt.addOutput({
    address: tip.tipAddress,
    value: Number(tip.tip),
  });

  const confirmationResponse2 = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(`Sending this doginal will cost you the following in DOGE`),
        copyable((fee / 100_000_000).toString()),
        text('And doggyfi will additional charge the following in DOGE'),
        text('These will be added to the total cost of the transaction'),
        copyable((Number(tip.tip) / 100_000_000).toString()),
        text(
          'Please confirm this is OK to sign and broadcast the transaction...',
        ),
      ]),
    },
  });
  if (confirmationResponse2 !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  // log hex string of the psbt
  psbt.signAllInputs(
    bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes)),
  );

  const txHex = psbt.finalizeAllInputs().extractTransaction(true).toHex();
  const txResponse = await pushTransaction(txHex);
  if (txResponse === null) {
    throw new Error('Could not push transaction');
  }
  return txResponse.txid;
}

/**
 * Finds and spends a transferable transfer inscription, or from a specific utxo.
 *
 * @param _params - The parameters for sending a DRC20 token.
 * @returns The transaction hash.
 */
export async function sendDrc20(_params: sendDrc20Params): Promise<string> {
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm transaction'),
        divider(),
        text(`Send the following amount of ${_params.ticker}:`),
        copyable(_params.amount.toString()),
        text('To the following address:'),
        copyable(_params.toAddress),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Transaction must be approved by user');
  }
  const txResp = await fetchTxInfo(_params.utxo);
  if (txResp === null) {
    throw new Error('Could not fetch transaction details');
  }

  // fetch the tx for the hash, validate which index is the transferable output
  const { startIndex, endIndex } = await getSatRange(
    txResp,
    await getAddress({ addressIndex: _params.addressIndex }),
    makeTransferInscription(
      'drc-20',
      _params.ticker,
      _params.amount.toString(),
    ),
  );

  if (startIndex !== endIndex) {
    throw new Error('Overlapping sat ranges not supported');
  }

  return await sendDoginal(
    {
      addressIndex: _params.addressIndex,
      toAddress: _params.toAddress,
      utxo: _params.utxo,
      outputIndex: startIndex,
    },
    true,
    undefined,
  );
  // tx);
}

/**
 * Deploy a DRC20 token.
 *
 * @param params - The parameters for deploying a DRC20 token.
 */
export async function deployDrc20(
  params: DeployDrc20Params,
): Promise<[string, string]> {
  const response = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm DRC20 Deployment'),
        divider(),
        text('Deploying a DRC20 token with the following parameters:'),
        text(`Ticker: ${params.ticker}`),
        text(`Max Supply: ${params.maxSupply}`),
        text(`Limit: ${params.lim}`),
        text(`Decimals: ${params.decimals}`),
      ]),
    },
  });
  if (response !== true) {
    throw new Error('DRC20 deployment must be approved by user');
  }
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }
  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);

  // get doggyfi-api tip
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }

  const [txs, fees] = await mintDeploy(
    privkey,
    myAddress,
    params.ticker,
    params.maxSupply,
    params.lim,
    params.decimals,
    Number(tip.tip),
    tip.tipAddress,
  );

  // ask user to confirm fee
  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(`Deploying this DRC20 will cost you the following in DOGE`),
        copyable((fees / 100_000_000).toString()),
        text('And doggyfi will additional charge the following in DOGE'),
        text('These will be added to the total cost of the transaction'),
        copyable((Number(tip.tip) / 100_000_000).toString()),
        text('Please confirm this is OK to broadcast the transaction...'),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  // broadcast commit
  const commitResponse = await pushTransaction(txs[0]);
  if (commitResponse === null) {
    throw new Error('Could not push transaction');
  }
  // broadcast reveal
  const revealResponse = await pushTransaction(txs[1]);
  if (revealResponse === null) {
    throw new Error('Could not push transaction');
  }

  return [commitResponse.txid, revealResponse.txid];
}

/**
 * Return response from DoggyFi API for DRC20 balance for an address.
 *
 * @param params - The parameters for getting the DRC20 balance.
 * @returns The DRC20 balance.
 */
export async function getDrc20Balance(
  params: addressParams,
): Promise<Drc20BalData> {
  const account = await getAccount(params.addressIndex);
  if (!account.privateKeyBytes) {
    throw new Error('Unable to decode private key bytes');
  }

  const myAddress = await getAddress({ addressIndex: params.addressIndex });
  return await drc20BalByAddress(myAddress);
}

/**
 * Get drc20 info for a ticker.
 *
 * @param params - The parameters for getting the drc20 info.
 * @returns The drc20 info.
 */
export async function getDrc20Info(
  params: Drc20InfoParams,
): Promise<Drc20Info> {
  const info = await _getDrc20Info(params.ticker);
  if (info === null) {
    throw new Error('Could not fetch drc20 info');
  }
  return info;
}

/**
 * Add doggyfi-api tip to a transaction.
 *
 * @param psbt - The psbt to add the tip to.
 * @returns The psbt with the tip added.
 */
export async function addTip(
  psbt: bitcoin.Psbt,
): Promise<[bitcoin.Psbt, number]> {
  const tip = await getTipRate();
  if (tip === null) {
    throw new Error('Could not fetch tip rate');
  }

  psbt.addOutput({
    address: tip.tipAddress,
    value: Number(tip.tip),
  });
  return [psbt, Number(tip.tip)];
}
