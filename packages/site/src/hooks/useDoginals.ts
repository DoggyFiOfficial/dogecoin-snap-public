import { useState } from 'react';
import { sendDoginal } from '../utils';

export const useSendDoginals = () => {
  const [lastTxId, setLastTxId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const _sendDoginal = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setError(undefined);
      setLastTxId(undefined);
      setIsLoading(true);
      const toAddress = data.get('toAddress');
      const utxo = data.get('utxo');

      const response = await sendDoginal({
        toAddress: String(toAddress),
        utxo: String(utxo),
      });
      setLastTxId(response);
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

  return { lastTxId, isLoading, error, _sendDoginal };
};
