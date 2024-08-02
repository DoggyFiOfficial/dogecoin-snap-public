// test case for jest written to test that we can succesfully make a unsigned tx hex for a mint operation
import { mintDrc20, transferDrc20, mintDeploy } from '../doginals/doginals';
import {
  env,
  inscribeTests,
  mintTransferTests,
  deployTests,
} from '../../fakeEnv';

const validTicker = 'tfln';
const validAmount = 7;
const max = 1000000000;
const lim = 1000;
const dec = 1;

describe('mint_drc20 function', () => {
  it('should return the correct commit tx hex', async () => {
    const [result, fees] = await mintDrc20(
      env.PRIVATE_KEY,
      env.ADDRESS,
      validTicker,
      validAmount,
    );

    const testcommit = result[0] === inscribeTests.COMMIT;
    expect(testcommit).toBe(true);
    expect(fees).toBeGreaterThan(0);
  });

  it('should return the correct reveal tx hex', async () => {
    const [result, fees] = await mintDrc20(
      env.PRIVATE_KEY,
      env.ADDRESS,
      validTicker,
      validAmount,
    );

    const testreveal = result[1] === inscribeTests.REVEAL;

    expect(testreveal).toBe(true);
    expect(fees).toBeGreaterThan(0);
  });
});

describe('Will evaluate that we can make the correct hex for transfer of a drc20', () => {
  it('should return the correct commit tx hex', async () => {
    const [result, fees] = await transferDrc20(
      env.PRIVATE_KEY,
      env.ADDRESS,
      validTicker,
      validAmount,
    );

    const testcommit = result[0] === mintTransferTests.COMMIT;

    expect(testcommit).toBe(true);
    expect(fees).toBeGreaterThan(0);
  });

  it('should return the correct reveal tx hex', async () => {
    const [result, fees] = await transferDrc20(
      env.PRIVATE_KEY,
      env.ADDRESS,
      validTicker,
      validAmount,
    );

    const testreveal = result[1] === mintTransferTests.REVEAL;

    expect(testreveal).toBe(true);
    expect(fees).toBeGreaterThan(0);
  });
});

describe('Will evaluate that we can make the correct hex for deploy of a drc20', () => {
  it('should return the correct commit tx hex', async () => {
    const [result, fees] = await mintDeploy(
      env.PRIVATE_KEY,
      env.ADDRESS,
      validTicker,
      max,
      lim,
      dec,
    );

    const testcommit = result[0] === deployTests.COMMIT;

    expect(testcommit).toBe(true);
    expect(fees).toBeGreaterThan(0);
  });

  it('should return the correct reveal tx hex', async () => {
    const [result, fees] = await mintDeploy(
      env.PRIVATE_KEY,
      env.ADDRESS,
      validTicker,
      max,
      lim,
      dec,
    );

    const testcommit = result[1] === deployTests.REVEAL;

    expect(testcommit).toBe(true);
    expect(fees).toBeGreaterThan(0);
  });
});
