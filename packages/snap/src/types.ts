export type MakeTransactionParams = {
  addressIndex: number;
  toAddress: string;
  amountInSatoshi: number;
};
export type MintDrc20Params = {
  addressIndex: number;
  toAddress: string;
  ticker: string;
  amount: number;
};
export type addressParams = {
  addressIndex: number;
};
export type InscribeTransferDrc20Params = {
  addressIndex: number;
  toAddress: string;
  ticker: string;
  amount: number;
};
export type SendDoginalParams = {
  addressIndex: number;
  toAddress: string;
  utxo: string;
  outputIndex: number | undefined | null; // to account for different sat ranges and pointers...
};
export type sendDrc20Params = {
  addressIndex: number;
  toAddress: string;
  utxo: string;
  ticker: string;
  amount: number; // TODO make optional if specific utxo is specified, can do a lookup, or mint/send
};
export type DeployDrc20Params = {
  addressIndex: number;
  ticker: string;
  maxSupply: number;
  lim: number | undefined | null;
  decimals: number | undefined | null;
};
export type signPsbtParams = {
  addressIndex: number;
  psbtHexString: string;
};
export type pushPsbtParams = {
  psbtHexString: string;
};
export type signMessageParams = {
  addressIndex: number;
  message: string;
};
export type verifyMessageParams = {
  addressIndex: number;
  message: string;
  signature: string;
};
/** Throws if the value passed in isn't of type signPsbtParams.
 * 
 * @param params - The value to be checked.
 */
export function assertIsSignPsbtParams(
  params: unknown,
): asserts params is signPsbtParams {
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' &&
      'psbtHexString' in params &&
      typeof params.psbtHexString === 'string'
    )
  ) {
    throw new Error('params must be instance of `signPsbtParams`');
  }
}
/**
 * Throws if the value passed in isn't of type pushPsbtParams.
 * 
 * @param params - The value to be checked.
 */
export function assertIsPushPsbtParams(
  params: unknown,
): asserts params is pushPsbtParams {
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'psbtHexString' in params &&
      typeof params.psbtHexString === 'string'
    )
  ) {
    throw new Error('params must be instance of `pushPsbtParams`');
  }
}
/**
 * Throws if the value passed in isn't of type signMessageParams.
 * 
 * @param params - The value to be checked.
 */
export function assertIsSignMessageParams(
  params: unknown,
): asserts params is signMessageParams {
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' &&
      'message' in params &&
      typeof params.message === 'string'
    )
  ) {
    throw new Error('params must be instance of `signMessageParams`');
  }
}
/**
 * Throws if the value passed in isn't of type verifyMessageParams.
 * 
 * @param params - The value to be checked.
 */
export function assertIsVerifyMessageParams(
  params: unknown,
): asserts params is verifyMessageParams {
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' &&
      'message' in params &&
      typeof params.message === 'string' &&
      'signature' in params &&
      typeof params.signature === 'string'
    )
  ) {
    throw new Error('params must be instance of `verifyMessageParams`');
  }
}

/**
 * Throws if the value passed in isn't of type addressParams.
 *
 * @param params - The value to be checked.
 */
export function assertIsAddressParams(
  params: unknown,
): asserts params is addressParams {
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' &&
      params.addressIndex >= 0 && 
      Number.isInteger(params.addressIndex)
    )
  ) {
    throw new Error('params must be instance of `addressParams`');
  }
}
/**
 * Throws if the value passed in isn't of type MakeTransactionParams.
 *
 * @param params - The value to be checked.
 */
export function assertIsMakeTransactionParams(
  params: unknown,
): asserts params is MakeTransactionParams {
  let a = false;
  if (typeof params === 'object' && params !== null && 'addressIndex' in params && typeof params.addressIndex === 'number') {
    assertIsAddressParams({addressIndex: params.addressIndex});
    a = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'toAddress' in params &&
      typeof params.toAddress === 'string' &&
      'amountInSatoshi' in params &&
      typeof params.amountInSatoshi === 'number' &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' && a
    )
  ) {
    throw new Error('params must be instance of `MakeTransactionParams`' + JSON.stringify(params));
  }
}

/**
 * Throws if value passed in isn't of type mintDrc20Parmas
 *
 * @param params - The value to be checked.
 */
export function assertIsMintDrc20Params(
  params: unknown,
): asserts params is MintDrc20Params {
  let a = false;
  if (typeof params === 'object' && params !== null && 'addressIndex' in params && typeof params.addressIndex === 'number') {
    assertIsAddressParams({addressIndex: params.addressIndex});
    a = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'toAddress' in params &&
      typeof params.toAddress === 'string' &&
      'ticker' in params &&
      String(params.ticker).length === 4 &&
      typeof params.ticker === 'string' &&
      'amount' in params &&
      typeof params.amount === 'number' &&
      params.amount > 0 && 
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' && a
    )
  ) {
    throw new Error('params must be instance of `mintDrc20Params`');
  }
}

/**
 * Throws if value passed in isn't of type transferDrc20Parmas
 *
 * @param params - The value to be checked.
 */
export function assertIsInscribeTransferDrc20Params(
  params: unknown,
): asserts params is InscribeTransferDrc20Params {
  let a = false;
  if (typeof params === 'object' && params !== null && 'addressIndex' in params && typeof params.addressIndex === 'number') {
    assertIsAddressParams({addressIndex: params.addressIndex});
    a = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'toAddress' in params &&
      typeof params.toAddress === 'string' &&
      'ticker' in params &&
      String(params.ticker).length === 4 &&
      typeof params.ticker === 'string' &&
      'amount' in params &&
      typeof params.amount === 'number' &&
      params.amount > 0 && 
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' && a
    )
  ) {
    throw new Error('params must be instance of `transferDrc20Params`');
  }
}

/**
 * Throws if value passed in isn't of type SendDrc20Params
 *
 * @param params - The value to be checked.
 */
export function assertIsSendDoginalParams(
  params: unknown,
): asserts params is SendDoginalParams {
  let a = false;
  if (typeof params === 'object' && params !== null && 'addressIndex' in params && typeof params.addressIndex === 'number') {
    assertIsAddressParams({addressIndex: params.addressIndex});
    a = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'toAddress' in params &&
      typeof params.toAddress === 'string' &&
      'utxo' in params &&
      'utxo' !== null &&
      typeof params.utxo === 'string' &&
      params.utxo.length > 0 &&
      'outputIndex' in params && 
      (typeof params.outputIndex === 'number' ||
        params.outputIndex === undefined ||
        params.outputIndex === null) &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' && a
    )
  ) {
    throw new Error(
      `params must be instance of \`SendDoginalParams\`\n${JSON.stringify(
        params,
      )}`,
    );
  }
}

/**
 * Throws if value passed in isn't of type SendDrc20Params.
 *
 * @param params - The value to be checked.
 */
export function assertIsSendDrc20Params(
  params: unknown,
): asserts params is sendDrc20Params {
  let a = false;
  if (typeof params === 'object' && params !== null && 'addressIndex' in params && typeof params.addressIndex === 'number') {
    assertIsAddressParams({addressIndex: params.addressIndex});
    a = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'toAddress' in params &&
      typeof params.toAddress === 'string' &&
      'ticker' in params &&
      String(params.ticker).length === 4 &&
      typeof params.ticker === 'string' &&
      'amount' in params &&
      typeof params.amount === 'number' &&
      params.amount > 0 &&
      'utxo' in params &&
      'utxo' !== null &&
      typeof params.utxo === 'string' &&
      params.utxo.length > 0 &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' && a
    )
  ) {
    throw new Error(
      `params must be instance of \`sendDrc20Params\`\n${JSON.stringify(
        params,
      )}`,
    );
  }
}

/**
 * Throws if value passed in isn't of type deployDrc20Parmas
 *
 * @param params - The value to be checked.
 */
export function assertIsDeployDrc20Params(
  params: unknown,
): asserts params is DeployDrc20Params {
  const a =
    typeof params === 'object' &&
    params !== null &&
    'ticker' in params &&
    String(params.ticker).length === 4 &&
    typeof params.ticker === 'string' &&
    'name' in params &&
    typeof params.name === 'string' &&
    'maxSupply' in params &&
    typeof params.maxSupply === 'number' &&
    params.maxSupply > 0;

  let b: boolean;
  if (
    typeof params === 'object' &&
    params !== null &&
    'lim' in params &&
    params.lim !== null &&
    typeof params.lim === 'number' &&
    params.lim > 0 &&
    'decimals' in params &&
    params.decimals !== null &&
    typeof params.decimals === 'number' &&
    params.decimals > 0
  ) {
    b = true;
  } else if (
    typeof params === 'object' &&
    params !== null &&
    'lim' in params &&
    params.lim !== null &&
    typeof params.lim === 'number' &&
    params.lim > 0
  ) {
    b = true;
  } else if (
    typeof params === 'object' &&
    params !== null &&
    'decimals' in params &&
    params.decimals !== null &&
    typeof params.decimals === 'number' &&
    params.decimals > 0
  ) {
    b = true;
  } else {
    b = false;
  }
  let c = false;
  if (typeof params === 'object' && params !== null && 'addressIndex' in params && typeof params.addressIndex === 'number') {
    assertIsAddressParams({addressIndex: params.addressIndex});
    c = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }

  if (!(a && b && c)) {
    throw new Error('params must be instance of `deployDrc20Params`');
  }
}
