import type { RpcMethodTypes } from '@doggyfiofficial/dogecoin-snap';
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
 */
export const getAddress = async () => {
  return snapRpcRequest({
    snapRpcMethod: 'getAddress',
  });
};

/**
 * Invoke the "doge_getBalance" RPC method from the snap.
 */
export const getBalance = async () => {
  return snapRpcRequest({
    snapRpcMethod: 'getBalance',
  });
};

type MakeTransactionParams = {
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
  toAddress,
  amountInDoge,
}: MakeTransactionParams) => {
  const amountInSatoshi = amountInDoge * SATOSHI_TO_DOGE;
  return snapRpcRequest({
    snapRpcMethod: 'makeTransaction',
    params: {
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
  toAddress,
  ticker,
  amount,
}: {
  toAddress: string;
  ticker: string;
  amount: number;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'mintDrc20',
    params: {
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
  toAddress,
  ticker,
  amount,
}: {
  toAddress: string;
  ticker: string;
  amount: number;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'mintTransferDrc20',
    params: {
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
  toAddress,
  utxo,
  outputIndex,
}: {
  toAddress: string;
  utxo: string;
  outputIndex: number | undefined | null;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'sendDoginal',
    params: {
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
  toAddress,
  utxo,
  ticker,
  amount,
}: {
  toAddress: string;
  utxo: string;
  ticker: string;
  amount: number;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'sendDrc20',
    params: {
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
  ticker,
  maxSupply,
  lim,
  decimals,
}: {
  ticker: string;
  maxSupply: number;
  lim: number | undefined | null;
  decimals: number | undefined | null;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'deployDrc20',
    params: {
      ticker,
      maxSupply,
      lim,
      decimals,
    },
  });
};
