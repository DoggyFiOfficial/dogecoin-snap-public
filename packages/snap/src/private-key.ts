import { BIP44Node, getBIP44AddressKeyDeriver } from '@metamask/key-tree';

/**
 * Derive the single account we're using for this snap.
 * The path of the account is m/44'/1'/0'/0/0.
 */
export const getAccount = async (): Promise<BIP44Node> => {
  const dogecoinTestnetNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 3, // 3 is consistent with doge labs derivation path
    },
  });

  const deriveDogecoinTestnetPrivateKey = await getBIP44AddressKeyDeriver(
    dogecoinTestnetNode,
  );

  return deriveDogecoinTestnetPrivateKey(0);
};
