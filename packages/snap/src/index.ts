import { OnRpcRequestHandler } from '@metamask/snaps-types';
import {
  getAddress,
  getBalance,
  getTransactions,
  makeTransaction,
  mintDrc20,
  mintTransferDrc20,
  sendDrc20,
  sendDoginal,
  deployDrc20,
} from './rpc';
import {
  assertIsMakeTransactionParams,
  assertIsInscribeTransferDrc20Params,
  assertIsSendDoginalParams,
  assertIsSendDrc20Params,
  assertIsMintDrc20Params,
  assertIsDeployDrc20Params,
} from './types';

export * from './rpc-types';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'doge_getAddress':
      return getAddress();

    case 'doge_getTransactions':
      return getTransactions();

    case 'doge_getBalance':
      return getBalance();

    case 'doge_makeTransaction':
      assertIsMakeTransactionParams(request.params);
      return makeTransaction(request.params);

    case 'doge_mintDrc20':
      assertIsMintDrc20Params(request.params);
      return mintDrc20(request.params);

    case 'doge_mintTransferDrc20':
      assertIsInscribeTransferDrc20Params(request.params);
      return mintTransferDrc20(request.params);
    case 'doge_sendDrc20':
      assertIsSendDrc20Params(request.params);
      return sendDrc20(request.params);

    case 'doge_deployDrc20':
      assertIsDeployDrc20Params(request.params);
      return deployDrc20(request.params);

    case 'doge_sendDoginal':
      assertIsSendDoginalParams(request.params);
      return sendDoginal(request.params);

    default:
      throw new Error('Method not found.');
  }
};
