import { assert } from "console";

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
export type inscribeDataParams = {
  addressIndex: number;
  toAddress: string;
  data: string;
  contentType: string;
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
export type openDuneTxParams = {
  addressIndex: number;
  toAddress: string;
  tick: string;
  symbol: string;
  limit: string | null;
  divisibility: number;
  cap: string | null;
  heightStart: number | null;
  heightEnd: number | null;
  offsetStart: number | null;
  offsetEnd: number | null;
  premine: string;
  turbo: boolean;
  openMint: boolean;
};
export type sendDuneParams = {
  addressIndex: number;
  toAddress: string;
  amount: number;
  dune: string;
};
export type splitDuneTxParams = {
  addressIndex: number;
  txhash: string;
  vout: number;
  dune: string;
  decimals: number;
  amounts: string[];
  addresses: string[];
};
export type mintDuneTxParams = {
  addressIndex: number;
  toAddress: string;
  id: string;
  amount: string;
  receiver: string;
};
export type GetDuneBalancesParams = {
  addressIndex: number;
};
export type GetDuneMetadataParams = {
  duneId: string | undefined;
  duneName: string | undefined;
};
export type Drc20InfoParams = {
  ticker: string;
};
/**
 * Throws if the value passed in isn't of type inscribeDataParams.
 *
 * @param params - The value to be checked.
 */
export function assertIsInscribeData(
  params: unknown,
): asserts params is inscribeDataParams {
  let a = false;
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
    a = true;
  } else {
    throw new Error('params must include valid addressIndex');
  }
  if (
    !(
      typeof params === 'object' &&
      params !== null &&
      'data' in params &&
      typeof params.data === 'string' &&
      'toAddress' in params &&
      typeof params.toAddress === 'string' &&
      'addressIndex' in params &&
      typeof params.addressIndex === 'number' &&
      'contentType' in params &&
      typeof params.contentType === 'string' &&
      a
    )
  ) {
    throw new Error('params must be instance of `inscribeDataParams`');
  }
}
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
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
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
      typeof params.addressIndex === 'number' &&
      a
    )
  ) {
    throw new Error(
      'params must be instance of `MakeTransactionParams`' +
        JSON.stringify(params),
    );
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
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
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
      typeof params.addressIndex === 'number' &&
      a
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
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
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
      typeof params.addressIndex === 'number' &&
      a
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
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
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
      typeof params.addressIndex === 'number' &&
      a
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
 * Throws if value passed in isn't of type openDuneTxParams
 *
 * @param params - The value to be checked.
 */
export function assertIsOpenDuneTxParams(
  params: unknown,
): asserts params is openDuneTxParams {
  if (typeof params !== 'object' || params === null) {
    throw new Error('params must be an object and not null');
  }

  if (!('addressIndex' in params) || typeof params.addressIndex !== 'number') {
    throw new Error(
      'params must include a valid `addressIndex` of type number',
    );
  }
  assertIsAddressParams({ addressIndex: params.addressIndex });

  if (!('toAddress' in params) || typeof params.toAddress !== 'string') {
    throw new Error('params must include a valid `toAddress` of type string');
  }

  if (!('tick' in params) || typeof params.tick !== 'string') {
    throw new Error('params must include a valid `tick` of type string');
  }

  if (!('symbol' in params) || typeof params.symbol !== 'string') {
    throw new Error('params must include a valid `symbol` of type string');
  }

  // limit is optional
  if ('limit' in params && params.limit !== null && params.limit !== undefined && params.limit !== "") {
    if (
      !('limit' in params) ||
      typeof params.limit !== 'string' ||
      !(BigInt(params.limit) > BigInt(0))
    ) {
      throw new Error(
        `params must include a valid limit of type number and greater than 0 but got limit ' + ${params.limit} <--`,
      );
    }
  }

  if (
    !('divisibility' in params) ||
    typeof params.divisibility !== 'number' ||
    params.divisibility <= 0 ||
    params.divisibility > 255
  ) {
    throw new Error(
      'params must include a valid `divisibility` of type number and greater than 0 and less than 256',
    );
  }

  // cap is optional
  if ('cap' in params && params.cap !== null && params.cap !== undefined && params.cap !== "") {
    if (!('cap' in params) || typeof params.cap !== 'string' || !(BigInt(params.cap) > BigInt(0))) {
      throw new Error(
        'params must include a valid `cap` of type number and greater than 0',
      );
    }
  }

  // heightStart and heightEnd are optional
  if ('heightStart' in params && params.heightStart !== null && params.heightStart !== undefined && params.heightStart !== "") {
    if (
      !('heightStart' in params) ||
      typeof params.heightStart !== 'number' ||
      params.heightStart <= 0
    ) {
      throw new Error(
        'params must include a valid `heightStart` of type number and greater than 0 but got heightStart ' + params.heightStart + ' <--',
      );
    }

    if ('heightEnd' in params && params.heightEnd !== null && params.heightEnd !== undefined && params.heightEnd !== "") {
      if (
        !('heightEnd' in params) ||
        typeof params.heightEnd !== 'number' ||
        params.heightEnd <= 0
      ) {
        throw new Error(
          'params must include a valid `heightEnd` of type number and greater than 0',
        );
      }
    }
  } else {
    // if heightEnd is provided but heightStart is not, throw error
    if ('heightEnd' in params && params.heightEnd !== null && params.heightEnd !== undefined && params.heightEnd !== "") {
      throw new Error(
        'params must include a valid `heightEnd` of type number and greater than 0',
      );
    }
  }

  // offsetStart and offsetEnd are optional
  if ('offsetStart' in params && params.offsetStart !== null && params.offsetStart !== undefined && params.offsetStart !== "") {
    if (
      !('offsetStart' in params) ||
      typeof params.offsetStart !== 'number' ||
      params.offsetStart < 0
    ) {
      throw new Error(
        'params must include a valid `offsetStart` of type number and greater than or equal to 0',
      );
    }

    if (
      !('offsetEnd' in params) ||
      typeof params.offsetEnd !== 'number' ||
      params.offsetEnd < 0
    ) {
      throw new Error(
        'params must include a valid `offsetEnd` of type number and greater than or equal to 0',
      );
    }
  } else {
    // if offsetEnd is provided but offsetStart is not, throw error
    if ('offsetEnd' in params && params.offsetEnd !== null && params.offsetEnd !== undefined && params.offsetEnd !== "") {
      throw new Error(
        'params must include a valid `offsetEnd` of type number and greater than or equal to 0',
      );
    }
  }

  if (
    !('premine' in params) ||
    typeof params.premine !== 'string' ||
    !(BigInt(params.premine) >= BigInt(0))
  ) {
    throw new Error(
      'params must include a valid `premine` of type number and greater than or equal to 0',
    );
  }

  if (!('turbo' in params) || typeof params.turbo !== 'boolean') {
    throw new Error('params must include a valid `turbo` of type boolean');
  }

  if (!('openMint' in params) || typeof params.openMint !== 'boolean') {
    throw new Error('params must include a valid `openMint` of type boolean');
  }
}

/**
 * Throws if value passed in isn't of type sendDuneParams
 *
 * @param params - The value to be checked.
 */
export function assertIsSendDuneParams(
  params: unknown,
): asserts params is sendDuneParams {
  let a = false;
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
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
      'amount' in params &&
      'amount' !== null &&
      typeof params.amount === 'number' &&
      params.amount > 0 &&
      'dune' in params &&
      'dune' !== null &&
      typeof params.dune === 'string' &&
      a
    )
  ) {
    throw new Error(
      `params must be instance of \`sendDuneParams\`\n${JSON.stringify(
        params,
      )}`,
    );
  }
}

/**
 * Throws if value passed in isn't of type splitDuneTxParams
 *
 * @param params - The value to be checked.
 */
export function assertIsSplitDuneTxParams(
  params: unknown,
): asserts params is splitDuneTxParams {
  let a = false;
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
    a = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }
  if (
    !(
      typeof params === 'object' &&
      'txhash' in params &&
      'txhash' !== null &&
      typeof params.txhash === 'string' &&
      params.txhash.length > 0 &&
      'vout' in params &&
      typeof params.vout === 'number' &&
      params.vout >= 0 &&
      'dune' in params &&
      'dune' !== null &&
      typeof params.dune === 'string' &&
      'decimals' in params &&
      'decimals' !== null &&
      Array.isArray(params.decimals) &&
      'amounts' in params &&
      'amounts' !== null &&
      Array.isArray(params.amounts) &&
      'addresses' in params &&
      'addresses' !== null &&
      Array.isArray(params.addresses) &&
      a
    )
  ) {
    throw new Error(
      `params must be instance of \`splitDuneTxParams\`\n${JSON.stringify(
        params,
      )}`,
    );
  }
}

/**
 * Throws if value passed in isn't of type mintDuneTxParams
 *
 * @param params - The value to be checked.
 */
export function assertIsMintDuneTxParams(
  params: unknown,
): asserts params is mintDuneTxParams {
  let a = false;
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
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
      'id' in params &&
      'id' !== null &&
      typeof params.id === 'string' &&
      params.id.length > 0 &&
      'amount' in params &&
      typeof params.amount === 'string' &&
      BigInt(params.amount) > BigInt(0) &&
      'receiver' in params &&
      'receiver' !== null &&
      typeof params.receiver === 'string' &&
      a
    )
  ) {
    throw new Error(
      `params must be instance of \`mintDuneTxParams\`\n${JSON.stringify(
        params,
      )}`,
    );
  }
}

/**
 * Asserts that the provided parameters conform to the `GetDuneMetadataParams` interface.
 *
 * This function performs type narrowing, ensuring that if no error is thrown, the `params`
 * can be safely treated as `GetDuneMetadataParams`. It checks for the presence of either
 * `duneId` or `duneName`, and throws errors for invalid or missing parameters.
 *
 * @param params - The parameters to check, expected to be an object containing either 'duneId' or 'duneName'.
 * @throws {Error}
 *   - If `params` is not an object.
 *   - If neither `duneId` nor `duneName` is provided.
 *   - If `params` does not contain either `duneId` or `duneName`.
 */
export function assertIsGetDuneMetadataParams(
  params: unknown,
): asserts params is GetDuneMetadataParams {
  if (typeof params !== 'object' || params === null) {
    throw new Error('Params must be an object');
  }

  const paramsObj = params as Record<string, unknown>;

  if ('duneId' in paramsObj && 'duneName' in paramsObj) {
    if (paramsObj.duneId === undefined && paramsObj.duneName === undefined) {
      throw new Error('Must provide either duneId or duneName');
    }
    // check type of duneId and duneName are string
    if (
      typeof paramsObj.duneId !== 'string' ||
      typeof paramsObj.duneName !== 'string'
    ) {
      throw new Error('duneId and duneName must be strings');
    }
  } else if ('duneId' in paramsObj) {
    if (paramsObj.duneId === undefined) {
      throw new Error('Must provide duneId or duneName');
    }
    // check type of duneId is string
    if (typeof paramsObj.duneId !== 'string') {
      throw new Error('If only provinding duneId, duneId must be a string');
    }
  } else if ('duneName' in paramsObj) {
    if (paramsObj.duneName === undefined) {
      throw new Error('Must provide duneName or duneId');
    }
    // check type of duneName is string
    if (typeof paramsObj.duneName !== 'string') {
      throw new Error('If only provinding duneName, duneName must be a string');
    }
  } else {
    throw new Error('Params must contain fields duneId or duneName');
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
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
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
      typeof params.addressIndex === 'number' &&
      a
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
  if (
    typeof params === 'object' &&
    params !== null &&
    'addressIndex' in params &&
    typeof params.addressIndex === 'number'
  ) {
    assertIsAddressParams({ addressIndex: params.addressIndex });
    c = true;
  } else {
    throw new Error('params must be instance of `MakeTransactionParams`');
  }

  if (!(a && b && c)) {
    throw new Error('params must be instance of `deployDrc20Params`');
  }
}

/**
 * Throws if value passed in isn't of type Drc20InfoParams
 * 
 * @param params - The value to be checked.
 */
export function assertIsDrc20InfoParams(
  params: unknown,
): asserts params is Drc20InfoParams {
  if (
    typeof params === 'object' &&
    params !== null &&
    'ticker' in params &&
    typeof params.ticker === 'string' &&
    params.ticker.length === 4
  ) {
    return;
  }
  throw new Error('params must be instance of `Drc20InfoParams`');
}