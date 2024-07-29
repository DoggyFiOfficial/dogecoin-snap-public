export type MakeTransactionParams = {
  toAddress: string;
  amountInSatoshi: number;
};
export type MintDrc20Params = {
  toAddress: string;
  ticker: string;
  amount: number;
};
export type InscribeTransferDrc20Params = {
  toAddress: string;
  ticker: string;
  amount: number;
};
export type SendDoginalParams = {
  toAddress: string;
  utxo: string;
  outputIndex: number | undefined | null; // to account for different sat ranges and pointers...
};
export type sendDrc20Params = {
  toAddress: string;
  utxo: string;
  ticker: string;
  amount: number; // TODO make optional if specific utxo is specified, can do a lookup, or mint/send
};
export type DeployDrc20Params = {
  ticker: string;
  maxSupply: number;
  lim: number | undefined | null;
  decimals: number | undefined | null;
};
/**
 * Throws if the value passed in isn't of type MakeTransactionParams.
 *
 * @param params - The value to be checked.
 */
export function assertIsMakeTransactionParams(
  params: unknown,
): asserts params is MakeTransactionParams {
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'toAddress' in params &&
      typeof params.toAddress === 'string' &&
      'amountInSatoshi' in params &&
      typeof params.amountInSatoshi === 'number'
    )
  ) {
    throw new Error('params must be instance of `MakeTransactionParams`');
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
      params.amount > 0
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
      params.amount > 0
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
        params.outputIndex === null)
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
 * Throws if value passed in isn't of type SendDrc20Params
 *
 * @param params - The value to be checked.
 */
export function assertIsSendDrc20Params(
  params: unknown,
): asserts params is sendDrc20Params {
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
      params.utxo.length > 0
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

  if (a && b) {
    throw new Error('params must be instance of `deployDrc20Params`');
  }
}
