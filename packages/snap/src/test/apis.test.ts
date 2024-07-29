// test cases for doggyfi apis
import {
  getDogeOrdUnspents,
  getAllTxnsForAddress,
  getBalanceForAddress,
  getTxByHash,
  getUtxosForValue,
  getFees,
  getTransactionHex,
} from '../tatum'; // replace with the actual file name

import { getRpcTxDtails } from '../queries';

// TODO:S TEST WITH MOCKS
// TODO: CREATE BETTER CHECKS ON RESPONSES RATHER THAN THEY EXIST
// jest.mock('node-fetch');
// const { Response } = jest.requireActual('node-fetch');

describe('getDogeOrdUnspents', () => {
  it('should fetch unspent transactions for an address', async () => {
    const address = 'D69oWRpL59Tu52WsbuPcDcXvemKtNzFrWZ';
    // const mockData = [
    //   {
    //     tx_hash: 'hash1',
    //     tx_output_n: 0,
    //     address: 'some-address',
    //     value: '1000',
    //     confirmations: 1,
    //     script: 'some-script'
    //   },
    //   // more mock data
    // ];

    // (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
    //   new Response(JSON.stringify(mockData))
    // );

    const result = await getDogeOrdUnspents(address);
    expect(result).toBeDefined();
    // console.log(result.length);

    // check that the length of result json s non-zero
    // expect(result.length).toBeGreaterThan(0);

    // check that every response has the required fields
    // result.forEach((res) => {
    //   expect(res.tx_hash).toBeDefined();
    //   expect(res.tx_output_n).toBeDefined();
    //   expect(res.address).toBeDefined();
    //   expect(res.value).toBeDefined();
    //   expect(res.confirmations).toBeDefined();
    //   expect(res.script).toBeDefined();
    // });

    // expect(result).toEqual(mockData);
  });
});

describe('getRpcTxDtails', () => {
  it('should get the transaction details by hash', async () => {
    const hash =
      'c89f27bbea7a539b798110380b485f0b97c69fa79dde0979c2de4d074c2dafe3';

    const result = await getRpcTxDtails(hash);
    expect(result).toBeDefined();
  });
});

describe('getAllTxnsForAddress', () => {
  it('should get all transactions for an address', async () => {
    const address = 'D69oWRpL59Tu52WsbuPcDcXvemKtNzFrWZ';
    // const mockUnspents = [
    //   {
    //     tx_hash: 'hash1',
    //     tx_output_n: 0,
    //     address: 'some-address',
    //     value: '1000',
    //     confirmations: 1,
    //     script: 'some-script'
    //   },
    //   // more mock data
    // ];

    // const getRpcTxDtails = jest.fn().mockResolvedValue(mockTxDetails);
    const result = await getAllTxnsForAddress(address);
    expect(result).toBeDefined();
    // expect(result).toEqual([mockTxDetails]);
  });
});

describe('getBalanceForAddress', () => {
  it('should get the balance for an address', async () => {
    const address = 'D69oWRpL59Tu52WsbuPcDcXvemKtNzFrWZ';
    // const mockData = {
    //   result: {
    //     balance: 1000000000 // in satoshis
    //   },
    //   error: null
    // };

    // (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
    //   new Response(JSON.stringify(mockData))
    // );
    const result = await getBalanceForAddress(address);
    expect(result).toBeDefined();
  });
});

describe('getTxByHash', () => {
  it('should get transaction details by hash', async () => {
    const txHash =
      'c89f27bbea7a539b798110380b485f0b97c69fa79dde0979c2de4d074c2dafe3';

    const result = await getTxByHash(txHash);
    expect(result).toBeDefined();
  });
});

describe('getUtxosForValue', () => {
  it('should get UTXOs for a given value', async () => {
    const address = 'D69oWRpL59Tu52WsbuPcDcXvemKtNzFrWZ';
    const value = 1000;

    const result = await getUtxosForValue(address, value);
    expect(result).toBeDefined();
  });
});

describe('getFees', () => {
  it('should return the hardcoded fee rates', () => {
    const fees = getFees();
    expect(fees.fast).toBeGreaterThan(0);
    expect(fees.medium).toBeGreaterThan(0);
    expect(fees.slow).toBeGreaterThan(0);
    expect(fees.block).toBeGreaterThan(0);
  });
});

describe('getTransactionHex', () => {
  it('should get the transaction hex by hash', async () => {
    const txHash =
      'c89f27bbea7a539b798110380b485f0b97c69fa79dde0979c2de4d074c2dafe3';
    const result = await getTransactionHex(txHash);
    expect(result).toBeDefined();
  });
});
