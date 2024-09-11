import { useEffect, useState } from 'react';
import { getAddress } from '../utils';

export const useAddress = (isSnapInstalled: boolean, _addressIndex: number) => {
  const [address, setAddress] = useState<string | undefined>();

  useEffect(() => {
    if (isSnapInstalled) {
      (async () => {
        const addressResponse = await getAddress(_addressIndex);
        if (addressResponse) {
          setAddress(addressResponse);
        }
      })();
    }
  }, [isSnapInstalled]);

  return { address };
};
