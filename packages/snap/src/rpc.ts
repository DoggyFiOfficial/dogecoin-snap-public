import * as bitcoin from 'bitcoinjs-lib';
import * as bitcoinMessage from 'bitcoinjs-message';
// @ts-expect-error No types exist
import coininfo from 'coininfo';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-ui';
import {
  broadcastSignedTransaction,
  DogeOrdUnspent,
  getAllTxnsForAddress,
  getBalanceForAddress,
  getFees,
  getTransactionHex,
  getUtxosForValue,
} from './tatum';
import { getRpcTxDtails, RPCTransaction, Transaction } from './queries';
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
} from './types';
import {
  mintDeploy,
  mintDrc20 as _mintDrc20,
  transferDrc20,
} from './doginals/doginals';
import { getSatRange } from './find-ord-index';
import { makeTransferInscription } from './doginals/inscribeMethods';

// const dogecoinFormat = coininfo.dogecoin.test.toBitcoinJS();
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
  params: addressParams
): Promise<Transaction[]> => {
  // TODO: Replace TATUM
  const myAddress = await getAddress(params);
  return getAllTxnsForAddress(myAddress);
};

/**
 * Get the balance for the given address index.
 * 
 * @param params The parameters for getting the balance.
 * @returns The balance of the address.
 */
export const getBalance = async (params: addressParams): Promise<number> => {
  const myAddress = await getAddress(params);
  const balanceResponse = await getBalanceForAddress(myAddress);
  return Number(balanceResponse) / 10 ** 8;
};

/**
 * Create a Dogecoin P2PKH transaction and broadcast it over the network. The current
 * logic is very raw. Among other things:
 * - It's missing much error checking.
 * - It uses JavaScript's Number type, which only has so much decimal precision.
 * - The fees are calculated using Mainnet, since the API we use doesn't provide Testnet fees.
 * - The fees are subtracted from the amount to send.
 * - Probably many other bugs and issues...
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
 */
export const makeTransaction = async ({
  addressIndex,
  toAddress,
  amountInSatoshi,
}: MakeTransactionParams): Promise<string> => {
  const amountInDoge = amountInSatoshi / SATOSHI_TO_DOGE;
  const confirmationResponse = await snap.request({
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

  const account = await getAccount( addressIndex );
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({addressIndex: addressIndex});
  const utxos = await getUtxosForValue(myAddress, amountInSatoshi); // this is the broken function....

  if (utxos.length === 0) {
    throw new Error('No unspents for address');
  }
  const fees = await getFees();
  const feePerByte = fees.medium;

  await Promise.all(
    utxos.map(async (utxo) => {
      let txHex;
      try {
        txHex = await getTransactionHex(utxo.tx_hash);
      } catch (err: any) {
        const msg = `error while getting transaction hex${err} ${utxo.tx_hash}`;
        throw new Error(msg);
      }

      psbt.addInput({
        hash: utxo.tx_hash,
        index: utxo.tx_output_n, // note this typing is specific to dogeord responses...
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });
    }),
  );

  const estimatedTxSize = utxos.length * 180 + 2 * 34 + 10;
  const fee = Math.floor(estimatedTxSize * feePerByte);

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

  try {
    psbt.addOutput({
      address: myAddress,
      value: changeValue,
    });
  } catch (err) {
    console.error('error while adding output', err);
  }

  psbt.signAllInputs(
    bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes)),
  );

  const txHex = psbt.finalizeAllInputs().extractTransaction(true).toHex();
  const txResponse = await broadcastSignedTransaction(txHex);
  return txResponse;
};

/**
 * Signs a PSBT with the selected private key.
 * 
 * @param addressIndex - The address index to use.
 * @param psbt - The PSBT to sign.
 * @returns The signed PSBT as a hex string.
*/
export async function signPsbt(
  params: signPsbtParams,
): Promise<string> {
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
  
  const psbtCopy = bitcoin.Psbt.fromHex(params.psbtHexString, { network: dogecoinNetwork });
  
  psbtCopy.signAllInputs(
    bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes)),
  );

  return psbtCopy.toHex();
}

/**
 * Signs a Message with the selected private key.
 * 
 * @param addressIndex - The address index to use.
 * @param message - The message to sign.
 * @returns The signed message.
 */
export async function signMessage(
  params: signMessageParams,
): Promise<string> {
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

  const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes), {
    network: dogecoinNetwork,
  });
  const privateKey = keyPair.privateKey;
  if (!privateKey) {
    throw new Error('Private key is required');
  }
  const signature = bitcoinMessage.sign(params.message, privateKey, keyPair.compressed);
  return signature.toString('base64');
}

/**
 * Verifies a message with the selected address.
 * 
 * @param addressIndex 
 * @param message 
 * @param signature 
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
  const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes), {
    network: dogecoinNetwork,
  });
  const publicKey = keyPair.publicKey;
  if (!publicKey) {
    throw new Error('Public key is required');
  }
  return bitcoinMessage.verify(params.message, address, Buffer.from(params.signature, 'base64'));
}

/**
 * Pushes a signed PSBT to the network.
 * 
 * @param psbt 
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
  const psbt = bitcoin.Psbt.fromHex(params.psbtHexString, { network: dogecoinNetwork });
  const txHex = psbt.finalizeAllInputs().extractTransaction(true).toHex();
  return await broadcastSignedTransaction(txHex);
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
  const account = await getAccount( params.addressIndex );
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }
  const myAddress = await getAddress({addressIndex : params.addressIndex});
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const [txs, fees] = await _mintDrc20(
    privkey,
    myAddress,
    params.ticker,
    params.amount,
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
  const commitResponse = await broadcastSignedTransaction(txs[0]);
  // broadcast reveal
  const revealResponse = await broadcastSignedTransaction(txs[1]);

  return [commitResponse, revealResponse];
}

/**
 * Mint a DRC20 token and transfer it to another address.
 *
 * @param params - The parameters for minting and transferring a DRC20 token.
 */
export async function mintTransferDrc20(
  params: InscribeTransferDrc20Params,
): Promise<[string, string]> {
  const account = await getAccount( params.addressIndex );
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }
  const myAddress = await getAddress({addressIndex : params.addressIndex});
  const privkey = deriveBase58PrivateKey(account.privateKeyBytes);
  const [txs, fees] = await transferDrc20(
    privkey,
    myAddress,
    params.ticker,
    params.amount,
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
  const commitResponse = await broadcastSignedTransaction(txs[0]);
  // broadcast reveal
  const revealResponse = await broadcastSignedTransaction(txs[1]);
  return [commitResponse, revealResponse];
}

/**
 * Validates if a utxo is indeed a doginal.
 *
 * @param tx - The transaction to validate.
 * @returns True if the transaction is a doginal, false otherwise.
 */
export async function isDoginal(tx: RPCTransaction) {
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
  _tx: RPCTransaction | undefined = undefined,
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

  const account = await getAccount( _params.addressIndex );
  if (!account.privateKeyBytes) {
    throw new Error('Private key is required');
  }

  const myAddress = await getAddress({addressIndex : _params.addressIndex});
  let doginalUtxo: DogeOrdUnspent | undefined;
  if (!doginalUtxo) {
    // fetch the utxo we need to spend
    let utxoTx;
    if (_tx) {
      utxoTx = _tx;
    } else {
      utxoTx = await getRpcTxDtails(_params.utxo);
    }

    if (utxoTx && !isDoginal(utxoTx)) {
      throw new Error('Invalid UTXO for Doginal');
    }
    const _voutSciptPubKey = utxoTx.vout[_params.outputIndex || 0];
    doginalUtxo = {
      tx_hash: _params.utxo,
      address: myAddress,
      tx_output_n: _params.outputIndex || 0,
      value: String(_voutSciptPubKey.value * 100_000_000),
      confirmations: utxoTx.confirmations,
      script: _voutSciptPubKey.scriptPubKey.hex,
    };
  }

  // add doginal as 0th input
  psbt.addInput({
    hash: doginalUtxo.tx_hash,
    index: doginalUtxo.tx_output_n,
    nonWitnessUtxo: Buffer.from(
      await getTransactionHex(doginalUtxo.tx_hash),
      'hex',
    ),
  });

  // add inscription output
  psbt.addOutput({
    address: _params.toAddress,
    value: 100_000, // 100,000 shibes, this is the min amount amount
  });

  const fees = await getFees();
  const feePerByte = fees.medium;

  const estimatedTxSize = psbt.toBuffer().byteLength;
  const estimatedFee = Math.floor(estimatedTxSize * feePerByte);

  const confirmationResponse2 = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Confirm Fee Rate'),
        divider(),
        text(`Sending this doginal will cost you the following in DOGE`),
        copyable((estimatedFee / 100_000_000).toString()),
        text('Please confirm this is OK to continue...'),
      ]),
    },
  });
  if (confirmationResponse2 !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  // fetch the utxos to fund the fee
  const utxos = await getUtxosForValue(myAddress, estimatedFee);
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
      let txHex;
      try {
        txHex = await getTransactionHex(iutxo.tx_hash);
      } catch (err: any) {
        const msg = `error while getting transaction hex${err} ${iutxo.tx_hash}`;
        throw new Error(msg);
      }

      psbt.addInput({
        hash: iutxo.tx_hash,
        index: iutxo.tx_output_n, // note this typing is specific to dogeord responses...
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });
    }),
  );

  // calculate change amount to return to sender
  const changeValue = Math.floor(totalUtxoValue - estimatedFee - 100_000);

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

  psbt.signAllInputs(
    bitcoin.ECPair.fromPrivateKey(Buffer.from(account.privateKeyBytes)),
  );

  const txHex = psbt.finalizeAllInputs().extractTransaction(true).toHex();
  const txResponse = await broadcastSignedTransaction(txHex);
  return txResponse;
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

  // fetch the tx for the hash, validate which index is the transferable output
  const { startIndex, endIndex } = await getSatRange(
    await getRpcTxDtails(_params.utxo),
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
  const [txs, fees] = await mintDeploy(
    privkey,
    myAddress,
    params.ticker,
    params.maxSupply,
    params.lim,
    params.decimals,
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
        text('Please confirm this is OK to continue...'),
      ]),
    },
  });
  if (confirmationResponse !== true) {
    throw new Error('Transaction fee must be approved by user');
  }

  // broadcast commit
  const commitResponse = await broadcastSignedTransaction(txs[0]);
  // broadcast reveal
  const revealResponse = await broadcastSignedTransaction(txs[1]);

  return [commitResponse, revealResponse];
}
