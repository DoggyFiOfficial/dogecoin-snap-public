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
 * Invoke the "doge_getAddress" RPC method from the snap.
 *
 * @params - The address parameters.
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
 * Invoke the "doge_getBalance" RPC method from the snap.
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
 * @param params.toAddress - The address to send DOGE to.
 * @param params.amountInDoge - The amount to send in DOGE.
 * @param params.ticker
 * @param params.amount
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
 * Invoke the "doge_inscribeTransferDrc20" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.toAddress: - The DOGE address to inscribe the DRC20 to.
 * @param params.ticker
 * @param params.amount
 * @param params.toAddress
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
 * @param params.toAddress - The address to send DOGE to.
 * @param params.utxo - The amount to send in DOGE.
 * @param params.outputIndex
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
 * @param params.toAddress - The address to send DRC20 to.
 * @param params.utxo - The UTXO to send.
 * @param params.ticker - The ticker of the DRC20.
 * @param params.amount - The amount to send.
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
 * Invoke the "doge_deployDrc20" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.ticker - The ticker of the DRC20.
 * @param params.maxSupply - The maximum supply of the DRC20.
 * @param params.lim - The limit of the DRC20.
 * @param params.decimals - The decimals of the DRC20.
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

/** method to send a Dune
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The address index.
 * @param params.dune - The dune to send.
 * @returns The transaction hash.
 */
export const sendDune = async ({
  addressIndex,
  toAddress,
  amount,
  dune,
}: {
  addressIndex: number;
  toAddress: string;
  amount: number;
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
 * @param params.addressIndex - The address index.
 * @param params.toAddress - The address to send the dune to.
 * @param params.limit - The limit of the dune.
 * @param params.divisibility - The divisibility of the dune.
 * @param params.cap - The cap of the dune.
 * @param params.heightStart - The start height of the dune.
 * @param params.heightEnd - The end height of the dune.
 * @param params.offsetStart - The start offset of the dune.
 * @param params.offsetEnd - The end offset of the dune.
 * @param params.premine - The premine of the dune.
 * @param params.turbo - The turbo of the dune.
 * @param params.openMint - The open mint of the dune.
 * @returns The transaction hash.
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
 * @param params.toAddress - The address to send the dune to.
 * @param params.id - The id of the dune.
 * @param params.amount - The amount of the dune.
 * @param params.receiver - The receiver of the dune.
 * @returns The transaction hash.
 */
export const mintDune = async ({
  addressIndex,
  toAddress,
  id,
  amount,
  receiver,
}: {
  addressIndex: number;
  toAddress: string;
  id: string;
  amount: string;
  receiver: string;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'mintDune',
    params: {
      addressIndex,
      toAddress,
      id,
      amount,
      receiver,
    },
  });
};

/**
 * Invoke the "doge_splitDune" RPC method from the snap.
 *
 * @param params - The transaction parameters.
 * @param params.addressIndex - The address index.
 * @param params.txhash - The transaction hash.
 * @param params.vout - The vout of the transaction.
 * @param params.decimals - The decimals of the dune.
 * @param params.amounts - The amounts of the dune.
 * @param params.addresses - The addresses of the dune.
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
