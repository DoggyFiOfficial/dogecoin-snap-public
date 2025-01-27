// hook for testing inscribe data (doginals)
import { useState } from 'react';
import { inscribeData } from '../utils';

export const useInscribeData = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setResult] = useState<any | null>(null);

  const _inscribeData = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const addressIndex = String(data.get('addressIndex'));
    const toAddress = String(data.get('toAddress'));
    const hexData = String(data.get('data'));
    const contentType = String(data.get('contentType'));

    const params = {
      addressIndex,
      toAddress,
      data: hexData,
      contentType,
    };

    try {
      const res = await inscribeData(params);
      setResult(res[1]);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return {
    error,
    isLoading,
    lastTxId,
    _inscribeData,
  };
};
