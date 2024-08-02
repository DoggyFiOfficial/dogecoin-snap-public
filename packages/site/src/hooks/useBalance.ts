import { useEffect, useState } from 'react';
import { getBalance } from '../utils';

export const useBalance = (isSnapInstalled: boolean, addressIndex: number) => {
  const [balance, setBalance] = useState<number | undefined>();

  useEffect(() => {
    if (isSnapInstalled) {
      (async () => {
        const balanceResponse = await getBalance(addressIndex);
        if (balanceResponse !== undefined) {
          setBalance(balanceResponse);
        }
      })();
    }
  }, [isSnapInstalled]);

  return { balance };
};
