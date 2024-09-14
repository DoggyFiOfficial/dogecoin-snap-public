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
  signPsbt,
  pushPsbt,
  signMessage,
  verifyMessage,
  sendDune,
  openDune,
  mintDune,
  splitDune,
  getDuneBalancesForAccount,
  getDuneMetadata,
  getDrc20Balance,
  inscribeData
} from './rpc';
import {
  assertIsMakeTransactionParams,
  assertIsInscribeTransferDrc20Params,
  assertIsSendDoginalParams,
  assertIsSendDrc20Params,
  assertIsMintDrc20Params,
  assertIsDeployDrc20Params,
  assertIsAddressParams,
  assertIsSignPsbtParams,
  assertIsPushPsbtParams,
  assertIsSignMessageParams,
  assertIsVerifyMessageParams,
  assertIsOpenDuneTxParams,
  assertIsMintDuneTxParams,
  assertIsSplitDuneTxParams,
  assertIsSendDuneParams,
  assertIsGetDuneMetadataParams,
  assertIsInscribeData,
} from './types';

export * from './rpc-types';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'doge_getAddress':
      assertIsAddressParams(request.params);
      return getAddress(request.params);

    case 'doge_getTransactions':
      assertIsAddressParams(request.params);
      return getTransactions(request.params);

    case 'doge_getBalance':
      assertIsAddressParams(request.params);
      return getBalance(request.params);

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

    case 'doge_signPsbt':
      assertIsSignPsbtParams(request.params);
      return signPsbt(request.params);

    case 'doge_pushPsbt':
      assertIsPushPsbtParams(request.params);
      return pushPsbt(request.params);

    case 'doge_signMessage':
      assertIsSignMessageParams(request.params);
      return signMessage(request.params);

    case 'doge_verifyMessage':
      assertIsVerifyMessageParams(request.params);
      return verifyMessage(request.params);
    case 'doge_sendDune':
      assertIsSendDuneParams(request.params);
      return sendDune(request.params);

    case 'doge_openDune':
      assertIsOpenDuneTxParams(request.params);
      return openDune(request.params);

    case 'doge_mintDune':
      assertIsMintDuneTxParams(request.params);
      return mintDune(request.params);

    case 'doge_splitDune':
      assertIsSplitDuneTxParams(request.params);
      return splitDune(request.params);

    case 'doge_getDuneBalancesForAccount':
      assertIsAddressParams(request.params);
      return getDuneBalancesForAccount(request.params);

    case 'doge_getDuneMetadata':
      assertIsGetDuneMetadataParams(request.params);
      return getDuneMetadata(request.params);
    
    case 'doge_getDrc20Balance':
      assertIsAddressParams(request.params);
      return getDrc20Balance(request.params);

    case 'doge_inscribeData':
      assertIsInscribeData(request.params);
      return inscribeData(request.params);

    default:
      throw new Error('Method not found.');
  }
};
