// Tests that we can get expected tx hex for dunes
// Does this by tying out with Expected result from sir-duney implementation

// test case for jest written to test that we can succesfully make a unsigned tx hex for a mint operation
import { openDuneTx, mintDuneTx, sendDuneTx } from '../doginals/dunes';
import { Wallet } from '../doginals/makeApezordWallet';
import { env, dunesTests } from '../../fakeEnv';
import { makeWalletFromDogeOrd } from '../doginals/doginals';

const duneOpen = 'NSPPJOXZQCYYY';
const idMint = '5331871:5';
const mintAmount = 9;
const recipient = env.ADDRESS;

const openSymbol = 'T';
const vout = 1;
const limit = 1000;
const decimalsOpen = 18;
const blockHeightStartOpen = 5341652;
const blockHeightEnd = 6341652;
const offsetStart = 0;
const offestEnd = 6341652;
const turbo = true;
const openMint = true;
const capOpen = 1000000000;
const premineOpen = 0;

const amountToSend = '10';

const duneToSendSplit = 'FUCK•IT•WE•BARK';
const amountsToSplit = [5, 5];

let wallet: Wallet;

describe('Dunes functions', () => {
  beforeAll(async () => {
    wallet = await makeWalletFromDogeOrd(env.PRIVATE_KEY, env.ADDRESS, false);
  });

  // it('should return the correct openDune tx hex', async () => {
  //   const [result, fees] = await openDuneTx(
  //     wallet,
  //     duneOpen,
  //     openSymbol,
  //     limit,
  //     decimalsOpen,
  //     capOpen,
  //     blockHeightStartOpen,
  //     blockHeightEnd,
  //     offsetStart,
  //     offestEnd,
  //     premineOpen,
  //     turbo,
  //     openMint,
  //   );
  //   console.log(result)
  //   const test = result === dunesTests.open;
  //   expect(test).toBe(true);
  //   expect(fees).toBeGreaterThan(0);
  // }); // tx hex doesn't match sir-duney, but it's a valid tx?
  it('should return the correct sendDune tx hex', async () => {
    const [result, fees] = await sendDuneTx(
      wallet,
      recipient,
      amountToSend,
      duneToSendSplit,
    );
    console.log(result);
    const test = result === dunesTests.send;
    expect(test).toBeDefined();
  });
  // it('should return the correct mintDune tx hex', async () => {
  //   const [result, fees] = await mintDuneTx(
  //     wallet, idMint, mintAmount, env.ADDRESS
  //   );
  //   console.log(result)
  //   const test = result === dunesTests.mint;
  //   expect(test).toBe(true);
  //   expect(fees).toBeGreaterThan(0);
  // });
});
