// tests that we can make a transaction to send Dogecoin to an address.

import { makeTransaction } from '../src/rpc';

const ADDRESS = 'DThpBEuU6Dp74p3Aqwd3pmZsQwmm43yF29'; // You may need to change this to your own address.

it('makeTransaction', async () => {
  const response = await makeTransaction(
    {
      toAddress: ADDRESS,
      amountInSatoshi: 100000000,
    },
    true,
    ADDRESS,
  );
  expect(response).toBeDefined();
  console.log('response: ', response);
});
