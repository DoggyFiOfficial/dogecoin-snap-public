import type { RpcMethodTypes } from '@doggyfi-official/kobosu';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

const SATOSHI_TO_DOGE = 100_000_000;

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

type SnapRpcRequestParams<M extends keyof RpcMethodTypes> =
  RpcMethodTypes[M]['input'] extends undefined
    ? { snapRpcMethod: M }
    : { snapRpcMethod: M; params: RpcMethodTypes[M]['input'] };

const snapRpcRequest = async <M extends keyof RpcMethodTypes>(
  args: SnapRpcRequestParams<M>,
) => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: `doge_${args.snapRpcMethod}`,
        params: 'params' in args ? args.params : undefined,
      },
    },
  });

  return result as unknown as RpcMethodTypes[M]['output'];
};

/**
 * Invoke the 'doge_inscribeData' RPC method from the snap.
 *
 * @param params - The parameters for the inscribeData method.
 * @param params.addressIndex - The index of the account to derive on 44'/3'/0/0/n.
 * @param params.toAddress - The address to which the data will be inscribed.
 * @param params.data - The data to be inscribed.
 * @param params.contentType - The MIME type of the data being inscribed.
 * @returns A promise that resolves with the result of the RPC method call.
 */
export const inscribeData = async ({
  addressIndex,
  toAddress,
  data,
  contentType,
}: {
  addressIndex: string;
  toAddress: string;
  data: string;
  contentType: string;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'inscribeData',
    params: {
      addressIndex: Number(addressIndex),
      toAddress,
      data,
      contentType,
    },
  });
};

/**
 * Invoke the "doge_getAddress" RPC method from the snap to retrieve a Dogecoin address.
 *
 * @param addressIndex - The index of the address to retrieve from the wallet.
 * @returns Returns a promise that resolves to the result of the RPC request.
 */
export const getAddress = async (addressIndex: number) => {
  return snapRpcRequest({
    snapRpcMethod: 'getAddress',
    params: {
      addressIndex,
    },
  });
};

/**
 * Invokes the "doge_getBalance" RPC method via the snap to retrieve the balance for a specific address index.
 *
 * @param addressIndex - The index of the address for which to fetch the balance.
 * @returns A promise that resolves to the balance data returned by the RPC method.
 */
export const getBalance = async (addressIndex: number) => {
  return snapRpcRequest({
    snapRpcMethod: 'getBalance',
    params: {
      addressIndex,
    },
  });
};

type MakeTransactionParams = {
  addressIndex: number;
  amountInDoge: number;
  toAddress: string;
};

/**
 * Invoke the "doge_makeTransaction" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address to use for sending.
 * @param params.toAddress - The address to send DOGE to.
 * @param params.amountInDoge - The amount to send in DOGE.
 */
export const makeTransaction = async ({
  addressIndex,
  toAddress,
  amountInDoge,
}: MakeTransactionParams) => {
  const amountInSatoshi = amountInDoge * SATOSHI_TO_DOGE;
  return snapRpcRequest({
    snapRpcMethod: 'makeTransaction',
    params: {
      addressIndex,
      toAddress,
      amountInSatoshi,
    },
  });
};

/**
 * Invoke the "doge_mintDrc20" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address to use for minting.
 * @param params.toAddress - The address to send the minted tokens to.
 * @param params.ticker - The token ticker symbol.
 * @param params.amount - The amount of tokens to mint.
 * @returns A promise that resolves to the result of the RPC call.
 */
export const mintDrc20 = async ({
  addressIndex,
  toAddress,
  ticker,
  amount,
}: {
  addressIndex: number;
  toAddress: string;
  ticker: string;
  amount: number;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'mintDrc20',
    params: {
      addressIndex,
      toAddress,
      ticker,
      amount,
    },
  });
};

/**
 * Invokes the "doge_inscribeTransferDrc20" RPC method from the snap to mint and transfer DRC20 tokens.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address in the wallet to use for the transaction.
 * @param params.toAddress - The DOGE address to inscribe the DRC20 tokens to.
 * @param params.ticker - The ticker symbol of the DRC20 token to mint and transfer.
 * @param params.amount - The amount of DRC20 tokens to mint and transfer.
 * @returns A promise that resolves with the result of the RPC call.
 */
export const mintTransferDrc20 = async ({
  addressIndex,
  toAddress,
  ticker,
  amount,
}: {
  addressIndex: number;
  toAddress: string;
  ticker: string;
  amount: number;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'mintTransferDrc20',
    params: {
      addressIndex,
      toAddress,
      ticker,
      amount,
    },
  });
};

/**
 * Invoke the "doge_sendDoginal" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address in the wallet.
 * @param params.toAddress - The address to send DOGE to.
 * @param params.utxo - The Unspent Transaction Output (UTXO) string to use for the transaction.
 * @param params.outputIndex - The index of the output in the UTXO, can be undefined or null.
 */
export const sendDoginal = async ({
  addressIndex,
  toAddress,
  utxo,
  outputIndex,
}: {
  addressIndex: number;
  toAddress: string;
  utxo: string;
  outputIndex: number | undefined | null;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'sendDoginal',
    params: {
      addressIndex,
      toAddress,
      utxo,
      outputIndex,
    },
  });
};

/**
 * Invoke the "doge_sendDrc20" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address to use for the transaction.
 * @param params.toAddress - The address to send DRC20 to.
 * @param params.utxo - The UTXO to spend for the transaction.
 * @param params.ticker - The ticker symbol of the DRC20 token to send.
 * @param params.amount - The amount of DRC20 to send.
 */
export const sendDrc20 = async ({
  addressIndex,
  toAddress,
  utxo,
  ticker,
  amount,
}: {
  addressIndex: number;
  toAddress: string;
  utxo: string;
  ticker: string;
  amount: number;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'sendDrc20',
    params: {
      addressIndex,
      toAddress,
      utxo,
      ticker,
      amount,
    },
  });
};

/**
 * Invoke the "doge_deployDrc20" RPC method from the snap to deploy a new DRC20 token.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address to use for deployment.
 * @param params.ticker - The ticker symbol of the DRC20 token.
 * @param params.maxSupply - The maximum supply of the DRC20 token.
 * @param params.lim - The limit of the DRC20 token, can be null or undefined.
 * @param params.decimals - The number of decimal places for the DRC20 token, can be null or undefined.
 * @returns A promise that resolves to the result of the RPC call.
 */
export const deployDrc20 = async ({
  addressIndex,
  ticker,
  maxSupply,
  lim,
  decimals,
}: {
  addressIndex: number;
  ticker: string;
  maxSupply: number;
  lim: number | undefined | null;
  decimals: number | undefined | null;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'deployDrc20',
    params: {
      addressIndex,
      ticker,
      maxSupply,
      lim,
      decimals,
    },
  });
};

/**
 * Sends a Dune transaction.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address to use for sending the Dune.
 * @param params.toAddress - The destination address for the transaction.
 * @param params.amount - The amount of Dune to send.
 * @param params.dune - The specific type or identifier of the Dune to send.
 * @returns A promise that resolves to the transaction hash.
 */
export const sendDune = async ({
  addressIndex,
  toAddress,
  amount,
  dune,
}: {
  addressIndex: number;
  toAddress: string;
  amount: string;
  dune: string;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'sendDune',
    params: {
      addressIndex,
      toAddress,
      amount,
      dune,
    },
  });
};

/**
 * Invoke the "doge_openDune" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address from which to send the dune.
 * @param params.toAddress - The address to which the dune will be sent.
 * @param params.tick - The tick symbol for the dune.
 * @param params.symbol - The symbol of the dune.
 * @param params.limit - The limit of the dune, can be null if not applicable.
 * @param params.divisibility - The divisibility of the dune, determining how many decimal places it can have.
 * @param params.cap - The cap or maximum supply of the dune, can be null if not set.
 * @param params.heightStart - The starting block height for the dune, can be null if not set.
 * @param params.heightEnd - The ending block height for the dune, can be null if not set.
 * @param params.offsetStart - The starting offset for the dune, can be null if not set.
 * @param params.offsetEnd - The ending offset for the dune, can be null if not set.
 * @param params.premine - The amount of dune pre-mined, if any.
 * @param params.turbo - Indicates if turbo mode is enabled for faster processing.
 * @param params.openMint - Whether minting is open to public after initial distribution.
 * @returns The transaction hash resulting from the openDune operation.
 */
export const openDune = async ({
  addressIndex,
  toAddress,
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
  turbo,
  openMint,
}: {
  addressIndex: number;
  toAddress: string;
  tick: string;
  symbol: string;
  limit: string | null;
  divisibility: number;
  cap: string | null;
  heightStart: number | null;
  heightEnd: number | null;
  offsetStart: number | null;
  offsetEnd: number | null;
  premine: string;
  turbo: boolean;
  openMint: boolean;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'openDune',
    params: {
      addressIndex,
      toAddress,
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
      turbo,
      openMint,
    },
  });
};

/**
 * Invoke the "doge_mintDune" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The address index.
 * @param params.id - The id of the dune.
 * @param params.amount - The amount of the dune.
 * @param params.receiver - The receiver of the dune.
 * @returns The transaction hash.
 */
export const mintDune = async ({
  addressIndex,
  id,
  amount,
  receiver,
}: {
  addressIndex: number;
  id: string;
  amount: string;
  receiver: string;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'mintDune',
    params: {
      addressIndex,
      id,
      amount,
      receiver,
    },
  });
};

/**
 * Invokes the "doge_splitDune" RPC method from the snap to split a dune transaction.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The index of the address to use for the transaction.
 * @param params.txhash - The transaction hash.
 * @param params.vout - The vout (output index) of the transaction.
 * @param params.dune - The dune identifier, which was mistakenly omitted from the original docstring.
 * @param params.decimals - The number of decimal places for the dune value.
 * @param params.amounts - An array of amounts to distribute in the dune split.
 * @param params.addresses - An array of addresses where the dune amounts will be sent.
 * @returns A promise that resolves with the result of the RPC call.
 */
export const splitDune = async ({
  addressIndex,
  txhash,
  vout,
  dune,
  decimals,
  amounts,
  addresses,
}: {
  addressIndex: number;
  txhash: string;
  vout: number;
  dune: string;
  decimals: number;
  amounts: string[];
  addresses: string[];
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'splitDune',
    params: {
      addressIndex,
      txhash,
      vout,
      dune,
      decimals,
      amounts,
      addresses,
    },
  });
};
