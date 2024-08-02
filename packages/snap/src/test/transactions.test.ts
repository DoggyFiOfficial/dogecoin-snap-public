// tests that we can make a transaction to send Dogecoin to an address.

import { makeTransaction } from '../rpc';

const ADDRESS = 'DThpBEuU6Dp74p3Aqwd3pmZsQwmm43yF29'; // You may need to change this to your own address.
const ADDRESS_INDEX = 0;
it('makeTransaction', async () => {
  const response = await makeTransaction(
    {
      addressIndex: ADDRESS_INDEX,
      toAddress: ADDRESS,
      amountInSatoshi: 100000000,
    },
  );
  expect(response).toBeDefined();
});
