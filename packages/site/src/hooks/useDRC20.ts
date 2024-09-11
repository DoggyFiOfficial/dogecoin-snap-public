import { useState } from 'react';
import { mintDrc20, mintTransferDrc20, deployDrc20, sendDrc20 } from '../utils';

export const useDeployDRC20 = () => {
  const [lastTxId, setLastTxId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const _deployDrc20 = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setError(undefined);
      setLastTxId(undefined);
      setIsLoading(true);
      const addressIndex = data.get('addressIndex');
      const ticker = data.get('ticker');
      const maxSupply = data.get('maxSupply');
      const lim = data.get('lim');
      const decimals = data.get('decimals');

      const response = await deployDrc20({
        addressIndex: Number(addressIndex),
        ticker: String(ticker),
        maxSupply: Number(maxSupply),
        lim: lim ? Number(lim) : null,
        decimals: decimals ? Number(decimals) : null,
      });
      setLastTxId(response[1]); // last txid is the reveal tx
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError(`An unknown error occurred: ${JSON.stringify(err)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { lastTxId, isLoading, error, _deployDrc20 };
};

export const useMintDRC20 = () => {
  const [lastTxId, setLastTxId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const _mintDrc20 = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setError(undefined);
      setLastTxId(undefined);
      setIsLoading(true);
      const addressIndex = data.get('addressIndex');
      const toAddress = data.get('toAddress');
      const ticker = data.get('ticker');
      const amount = data.get('amount');

      const response: [string, string] = await mintDrc20({
        addressIndex: Number(addressIndex),
        toAddress: String(toAddress),
        ticker: String(ticker),
        amount: Number(amount),
      });
      setLastTxId(response[1]); // last txid is the reveal tx
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError(`An unknown error occurred: ${JSON.stringify(err)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { lastTxId, isLoading, error, _mintDrc20 };
};

export const useMintTransferDRC20 = () => {
  console.log('Line 89 inside of useMintTransferDRC20');
  const [lastTxId, setLastTxId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const _mintTransferDrc20 = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setError(undefined);
      setLastTxId(undefined);
      setIsLoading(true);
      const addressIndex = data.get('addressIndex');
      const toAddress = data.get('toAddress');
      const ticker = data.get('ticker');
      const amount = data.get('amount');
      console.log('Line 106 inside of useMintTransferDRC20');
      const response = await mintTransferDrc20({
        addressIndex: Number(addressIndex),
        toAddress: String(toAddress),
        ticker: String(ticker),
        amount: Number(amount),
      });
      setLastTxId(response[1]); // last txid is the reveal tx
      // setLastTxId(toAddress + "\n" + ticker + "\n" + amount)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError(`An unknown error occurred: ${JSON.stringify(err)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  console.log('Line 125 inside of useMintTransferDRC20');
  return { lastTxId, isLoading, error, _mintTransferDrc20 };
};

export const useSendDRC20 = () => {
  const [lastTxId, setLastTxId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const _sendDRC20 = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setError(undefined);
      setLastTxId(undefined);
      setIsLoading(true);
      const addressIndex = data.get('addressIndex');
      const toAddress = data.get('toAddress');
      const utxo = data.get('utxo');
      const ticker = data.get('ticker');
      const amount = data.get('amount');

      const response = await sendDrc20({
        addressIndex: Number(addressIndex),
        toAddress: String(toAddress),
        utxo: String(utxo),
        ticker: String(ticker),
        amount: Number(amount),
      });
      setLastTxId(response[1]); // last txid is the reveal tx
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError(`An unknown error occurred: ${JSON.stringify(err)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { lastTxId, isLoading, error, _sendDRC20 };
};
