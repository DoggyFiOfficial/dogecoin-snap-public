import { BIP44Node, getBIP44AddressKeyDeriver } from '@metamask/key-tree';

/**
 * Derive the single account we're using for this snap. The path of the account is m/44'/1'/0'/0/0.
 *
 * @param addressIndex - The index of the address to derive.
 * @returns A promise of the derived account. 
 */
export const getAccount = async (addressIndex = 0): Promise<BIP44Node> => {
  if (addressIndex < 0 || !Number.isInteger(addressIndex)) {
    throw new Error('Invalid address index');
  }
  const dogecoinTestnetNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 3, // 3 is consistent with doge labs derivation path
    },
  });

  const deriveDogecoinTestnetPrivateKey = await getBIP44AddressKeyDeriver(
    dogecoinTestnetNode,
  );

  return deriveDogecoinTestnetPrivateKey(addressIndex);
};
