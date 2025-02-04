# DoggyFi's Dogecoin & Doginals Snap 🐶

If you are looking to trade Dunes, DRC-20s, doginals, and/or dogecoin, and love metamask, then this is the snap for you! This open-source snap, created by DoggyFi, allows you not only to trade dogecoin, but also your favorite dogecoin assets (including token metaprotocols such as DRC-20, and Dunes) on the dogecoin network with ease.

For the technically inclined user, this readme will explain to you how you can set up the DoggyFi snap locally to do testing and build upon it yourself or integrate it into your own project.

Let's get started! 🎢🚀

## Audit
DoggyFi's snap has been throughly audited for potential attack vectors by Sayfer, you can read the audit report [here](https://sayfer.io/audits/metamask-snap-audit-report-for-doggyfi/).

## Video Preview
Per metamask's request, we have also created a video preview of the snap which you can view [here](https://drive.google.com/file/d/1ybk0g2ggQN3UoTQTkmkvf5tGohM9AOV3/view?usp=sharing).

## Pre-work

To run and test the snap in flask with our local testing site:

```javascript
bun i
bun run build
bun run start
```

Then open a browser window with metamask flask installed, and go to `http://localhost:8000`

**Some notes to avoid unnecessary headache**
*(1) If you are trying to run this locally, be sure you free up ports 8000 (site), and 8080 (mm-serve)*
*(2) Note, you may get some build errors if you do not use the reccomend version of node. Please run `nvm use` before starting*
*(3) While you don't have to run bun, it just makes local package management SO much easier. It is strongly reccomend*
*(4) If you are getting strange build errors, make sure you've cleared out any temporary caches, node modules, and/or lock files*

## Snap overview

Let's take a look at what you can do with DoggyFi's snap.

### 1. Send & Receive Dogecoin!
The snap allows you to both send and receive dogecoin using metamask. When you open your snap, by default it will derive the the first (0th) wallet using Bip44Entropy on the 3rd coin path. This is m/44'/3'/0'/0/0 to be specific, which is the same default derivation path such as other major wallets (e.g., dogelabs and mydoge). This means that given the same seed phrase, doggyfi's snap wallet will derive the same wallets that you'd expect from your other favorite wallets, all you have to do is use the same seed phrase!

### 2. Send & Receive Doginals!
The snap provides the following methods for doginals

(a) Send Doginal (Ordinal) Inscription -- Given the utxo of a doginal, and vout, you can send the doginal to another address.
(b) Inscibe Data (Ordinal) Inscription -- Given data in the form of a hex string, you can inscribe data to a doginal.

### 3. Send & Receive, deploy, mint, transfer DRC-20!
The snap allows you to do the following with DRC-20 tokens

(a) Deploy DRC-20 -- Deploy a DRC-20 token on the dogecoin network.
(b) Mint DRC-20 -- Mint a DRC-20 token on the dogecoin network.
(c) Mint Transfer Inscription / Make Token Amount Transferable -- Mint a transfer inscription, and make the token amount transferable.
(d) Send Transfer Inscription -- Send a transfer inscription to another address.

### 4. Send, Receive, Deploy, Mint, Dunes!
The snap allows you to do the following with Dunes

(a) Send Dune -- Send a Dune to another address.
(b) Open Dune -- Open a Dune on the dogecoin network.
(c) Mint Dune -- Mint a Dune on the dogecoin network.
(d) Send Dune -- Send a Dune to another address.
(e) Split Dune -- Split a Dune into specified amounts.

## RPC Documentation for DoggyFi Snap

This document provides detailed information on how to use the various RPC methods available in the snap. These methods allow you to interact with the Dogecoin network, manage wallets, perform transactions, and work with DRC20 tokens and Dunes.

## Adding DoggyFi Snap to your Site

We recommend creating a \`WalletProvider\` type, and implementing as follows:

```javascript
const snapOrigin = "npm:@doggyfi-official/kobosu"

const doggyfi: WalletProvider = {
  connect: async () => {
    const sdk = getSdk()
    await sdk.connect()

    const provider = sdk.getProvider()!
    await provider.request({
      method: "wallet_requestSnaps",
      params: {
        [snapOrigin]: {
          version: "0.1.10", // or whatever the current / latest version is
        },
      },
    })

    const address = (await invokeSnap("doge_getAddress", { addressIndex: 0 })) as string
    return { address, publicKey: "" }
  },
  getAddress: async () => {
    return invokeSnap("doge_getAddress", { addressIndex: 0 }) as Promise<string>
  },
  signMessage: async (message: string) => {
    return invokeSnap("doge_signMessage", { addressIndex: 0, message }) as Promise<string>
  },
  signPsdt: async (psdt: string) => {
    return invokeSnap("doge_signPsbt", { addressIndex: 0, psbtHexString: psdt }) as Promise<string>
  },
  isPresent: () => isInstalled(),
}
```

## Note on invoking Methods from Snap

Given the snap is available on \`window.Ethereum\`, it can be invoked as follows

#### Invocation example

Let’s suppose the name of the method is \`deployDrc20\`. To invoke the snap you could build the following method into your frontend

```javascript
export const deployDrc20 = async ({
  addressIndex,
  ticker,
  maxSupply,
  lim,
  decimals,
}: {
  addressIndex: number;
  ticker: string;
  maxSupply: number;
  lim: number | undefined | null;
  decimals: number | undefined | null;
}) => {
  return snapRpcRequest({
    snapRpcMethod: 'deployDrc20',
    params: {
      addressIndex,
      ticker,
      maxSupply,
      lim,
      decimals,
    },
  });
};
```

Where the method \`snapRpcRequest\` should be defined as

```javascript
type RpcMethods = typeof rpcMethods;
type InferArgs<M extends keyof RpcMethods> = RpcMethods[M] extends (
  ...args: infer A
) => unknown
  ? A[0]
  : never;

export type RpcMethodTypes = {
  [Method in keyof RpcMethods]: {
    input: InferArgs<Method>;
    output: ReturnType<RpcMethods[Method]>;
  };
};

type SnapRpcRequestParams<M extends keyof RpcMethodTypes> =
  RpcMethodTypes[M]['input'] extends undefined
    ? { snapRpcMethod: M }
    : { snapRpcMethod: M; params: RpcMethodTypes[M]['input'] };

const snapRpcRequest = async <M extends keyof RpcMethodTypes>(
  args: SnapRpcRequestParams<M>,
) => {
  const result = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: `doge_${args.snapRpcMethod}`,
        params: 'params' in args ? args.params : undefined,
      },
    },
  });

  return result as unknown as RpcMethodTypes[M]['output'];
};
```

## Methods

***Note*** that all methods defined here should be implemented in your code base by defining methods that invoke the snap, as defined in the “Invocation Example” under “Note on Invoking Methods under Snap”. The function definition below assumes that you have done this such that the \`params\` object being passed in is generated from the parameters form passed into \`window.ethereum.request\` on invoking the snap. Thus functional definitions given here show you what those methods expect internally. Use this as a guide to integrating the snap into your site.

### getAddress

Retrieve the Dogecoin address associated with a specific address index. Note that our snap derives wallet addresses using BIP44 entropy along the following derivation path: 44'/3'/0'/0/0

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address to retrieve.

#### Returns

\- \`Promise\<string\>\`: The Dogecoin address as a string.

#### Usage Example

```javascript
const address = await getAddress({ addressIndex: 0 });
console.log(`My Dogecoin address is: ${address}`);
```

### getTransactions

Fetch all transactions associated with a specific address index.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address whose transactions you want to retrieve.

#### Returns

\- \`Promise\<TxInfoResponse\[\]\>\`: An array of transaction information objects.

#### Usage Example

```javascript
const transactions = await getTransactions({ addressIndex: 0 });
console.log(`Transactions:`, transactions);
```

### getBalance

Retrieve the balance of a specific address index.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address whose balance you want to retrieve.

#### Returns

\- \`Promise\<number\>\`: The balance in DOGE.

#### Usage Example

```javascript
const balance = await getBalance({ addressIndex: 0 });
console.log(`Balance: ${balance} DOGE`);
```

### inscribeData

Inscribe arbitrary data onto the Dogecoin blockchain.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address to use.
  \- \`data\` (string): The data to inscribe.

#### Returns

\- \`Promise\<\[string, string\]\>\`: A tuple containing the commit transaction ID and the reveal transaction ID.

#### Usage Example

```javascript
const [commitTxId, revealTxId] = await inscribeData({
  addressIndex: 0,
  data: 'Hello, Dogecoin!',
});
console.log(`Commit TX ID: ${commitTxId}`);
console.log(`Reveal TX ID: ${revealTxId}`);
```

### makeTransaction

Create and broadcast a Dogecoin transaction.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the sender's address.
  \- \`toAddress\` (string): The recipient's Dogecoin address.
  \- \`amountInSatoshi\` (number): The amount to send in satoshis (1 DOGE \= 100,000,000 satoshis).

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

#### Usage Example

```javascript
const txId = await makeTransaction({
  addressIndex: 0,
  toAddress: 'D6gk2bNnNx9b1R7k2gDq6L1j4QW9Gqkdpk',
  amountInSatoshi: 500000000, // 5 DOGE
});
console.log(`Transaction ID: ${txId}`);
```

### signPsbt

Sign a Partially Signed Bitcoin Transaction (PSBT) using the specified private key.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address whose private key will be used for signing.
  \- \`psbtHexString\` (string): The PSBT in hex string format.
  \- \`signIndices\` (number\[\], optional): Specific input indices to sign. If not provided, all inputs will be signed.

#### Returns

\- \`Promise\<string\>\`: The signed PSBT as a hex string.

#### Usage Example

```javascript
const signedPsbt = await signPsbt({
  addressIndex: 0,
  psbtHexString: '<your_psbt_hex_string>',
});
console.log(`Signed PSBT: ${signedPsbt}`);
```

### signMessage

Sign a message using the specified private key.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address whose private key will be used for signing.
  \- \`message\` (string): The message to sign.

#### Returns

\- \`Promise\<string\>\`: The signed message in base64 format.

#### Usage Example

```javascript
const signature = await signMessage({
  addressIndex: 0,
  message: 'This is a test message.',
});
console.log(`Signature: ${signature}`);
```

### verifyMessage

Verify a signed message.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address that purportedly signed the message.
  \- \`message\` (string): The original message.
  \- \`signature\` (string): The signature in base64 format.

#### Returns

\- \`Promise\<boolean\>\`: \`true\` if the signature is valid; otherwise, \`false\`.

#### Usage Example

```javascript
const isValid = await verifyMessage({
  addressIndex: 0,
  message: 'This is a test message.',
  signature: '<signature_base64_string>',
});
console.log(`Is the signature valid? ${isValid}`);
```

### pushPsbt

Finalize and broadcast a signed PSBT.

#### Parameters

\- \`params\` (object):
  \- \`psbtHexString\` (string): The signed PSBT in hex string format.

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

#### Usage Example

```javascript
const txId = await pushPsbt({
  psbtHexString: '<signed_psbt_hex_string>',
});
console.log(`Transaction ID: ${txId}`);
```

### mintDrc20

Mint a specific amount of a DRC20 token.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the minter's address.
  \- \`ticker\` (string): The ticker symbol of the DRC20 token.
  \- \`amount\` (string): The amount to mint.

#### Returns

\- \`Promise\<\[string, string\]\>\`: A tuple containing the commit transaction ID and the reveal transaction ID.

#### Usage Example

```javascript
const [commitTxId, revealTxId] = await mintDrc20({
  addressIndex: 0,
  ticker: 'MYTOKEN',
  amount: '1000',
});
console.log(`Commit TX ID: ${commitTxId}`);
console.log(`Reveal TX ID: ${revealTxId}`);
```

### mintTransferDrc20

Mint and transfer a DRC20 token to another address.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the sender's address.
  \- \`ticker\` (string): The ticker symbol of the DRC20 token.
  \- \`amount\` (string): The amount to mint and transfer.

#### Returns

\- \`Promise\<\[string, string\]\>\`: A tuple containing the commit transaction ID and the reveal transaction ID.

#### Usage Example

```javascript
const [commitTxId, revealTxId] = await mintTransferDrc20({
  addressIndex: 0,
  ticker: 'MYTOKEN',
  amount: '500',
});
console.log(`Commit TX ID: ${commitTxId}`);
console.log(`Reveal TX ID: ${revealTxId}`);
```

### sendDune

Send a Dune token to a specified address.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the sender's address.
  \- \`dune\` (string): The identifier of the Dune token.
  \- \`amount\` (number): The amount to send.
  \- \`toAddress\` (string): The recipient's Dogecoin address.

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

#### Usage Example

```javascript
const txId = await sendDune({
  addressIndex: 0,
  dune: 'DUNE123',
  amount: 10,
  toAddress: 'D6gk2bNnNx9b1R7k2gDq6L1j4QW9Gqkdpk',
});
console.log(`Transaction ID: ${txId}`);
```

### openDune

Deploy an open Dune transaction.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the deployer's address.
  \- \`tick\` (string): The ticker symbol.
  \- \`symbol\` (string): The symbol of the Dune token.
  \- \`limit\` (string): The limit per mint.
  \- \`divisibility\` (string): The divisibility of the token.
  \- \`cap\` (string): The total supply cap.
  \- \`heightStart\` (string): The starting block height.
  \- \`heightEnd\` (string): The ending block height.
  \- \`offsetStart\` (string): The starting offset.
  \- \`offsetEnd\` (string): The ending offset.
  \- \`premine\` (string): The premine amount.
  \- \`turbo\` (boolean): Whether to enable turbo mode.
  \- \`openMint\` (boolean): Whether the minting is open.

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

#### Usage Example

```
const txId = await openDune({
  addressIndex: 0,
  tick: 'DUNETICK',
  symbol: 'DUNE',
  limit: '1000',
  divisibility: '8',
  cap: '1000000',
  heightStart: '0',
  heightEnd: '0',
  offsetStart: '0',
  offsetEnd: '0',
  premine: '10000',
  turbo: false,
  openMint: true,
});
console.log(`Transaction ID: ${txId}`);
```

### mintDune

Mint a Dune token.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the minter's address.
  \- \`id\` (string): The identifier of the Dune token.
  \- \`amount\` (string): The amount to mint.
  \- \`receiver\` (string): The recipient's Dogecoin address.

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

#### Usage Example

```
const txId = await mintDune({
  addressIndex: 0,
  id: 'DUNE123',
  amount: '500',
  receiver: 'D6gk2bNnNx9b1R7k2gDq6L1j4QW9Gqkdpk',
});
console.log(`Transaction ID: ${txId}`);
```

### splitDune

Split a Dune token among multiple addresses.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the sender's address.
  \- \`dune\` (string): The identifier of the Dune token.
  \- \`addresses\` (string\[\]): An array of recipient addresses.
  \- \`amounts\` (number\[\]): An array of amounts corresponding to each recipient.

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

####

#### Usage Example

```
const txId = await splitDune({
  addressIndex: 0,
  dune: 'DUNE123',
  addresses: [
    'D6gk2bNnNx9b1R7k2gDq6L1j4QW9Gqkdpk',
    'D7gk3bNnNx9b1R7k2gDq6L1j4QW9Gqkdpl',
  ],
  amounts: [250, 250],
});
console.log(`Transaction ID: ${txId}`);
```

### getDuneBalancesForAccount

Retrieve the Dune token balances for a specific account.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address whose balances you want to retrieve.

#### Returns

\- \`Promise\<Map\<string, DuneBalance\>\>\`: A map of Dune token identifiers to their balances.

#### Usage Example

```
const balances = await getDuneBalancesForAccount({ addressIndex: 0 });
console.log(`Dune Balances:`, balances);
```

### getDuneMetadata

Retrieve metadata for a specific Dune token.

#### Parameters

\- \`params\` (object):
  \- \`duneId\` (string, optional): The identifier of the Dune token.
  \- \`duneName\` (string, optional): The name of the Dune token.

#### Returns

\- \`Promise\<DuneInfo\>\`: An object containing metadata about the Dune token.

#### Usage Example

```
const duneInfo = await getDuneMetadata({ duneId: 'DUNE123' });
console.log(`Dune Info:`, duneInfo);
```

### sendDoginal

Send a Doginal (a Dogecoin ordinal) to a specified address.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the sender's address.
  \- \`utxo\` (string): The UTXO of the Doginal to send.
  \- \`toAddress\` (string): The recipient's Dogecoin address.
  \- \`outputIndex\` (number, optional): The output index of the Doginal.

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

#### Usage Example

```
const txId = await sendDoginal({
  addressIndex: 0,
  utxo: '<utxo_txid>',
  toAddress: 'D6gk2bNnNx9b1R7k2gDq6L1j4QW9Gqkdpk',
  outputIndex: 0,
});
console.log(`Transaction ID: ${txId}`);
```

### sendDrc20

Send a DRC20 token to a specified address.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the sender's address.
  \- \`ticker\` (string): The ticker symbol of the DRC20 token.
  \- \`amount\` (string): The amount to send.
  \- \`toAddress\` (string): The recipient's Dogecoin address.
  \- \`utxo\` (string): The UTXO containing the DRC20 token.

#### Returns

\- \`Promise\<string\>\`: The transaction ID of the broadcasted transaction.

#### Usage Example

```
const txId = await sendDrc20({
  addressIndex: 0,
  ticker: 'MYTOKEN',
  amount: '100',
  toAddress: 'D6gk2bNnNx9b1R7k2gDq6L1j4QW9Gqkdpk',
  utxo: '<utxo_txid>',
});
console.log(`Transaction ID: ${txId}`);
```

### deployDrc20

Deploy a new DRC20 token.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the deployer's address.
  \- \`ticker\` (string): The ticker symbol of the new DRC20 token.
  \- \`maxSupply\` (string): The maximum supply of the token.
  \- \`lim\` (string): The limit per mint.
  \- \`decimals\` (string): The number of decimal places.

#### Returns

\- \`Promise\<\[string, string\]\>\`: A tuple containing the commit transaction ID and the reveal transaction ID.

#### Usage Example

```
const [commitTxId, revealTxId] = await deployDrc20({
  addressIndex: 0,
  ticker: 'NEWCOIN',
  maxSupply: '1000000',
  lim: '1000',
  decimals: '8',
});
console.log(`Commit TX ID: ${commitTxId}`);
console.log(`Reveal TX ID: ${revealTxId}`);
```

### getDrc20Balance

Retrieve the DRC20 token balances for a specific address.

#### Parameters

\- \`params\` (object):
  \- \`addressIndex\` (number): The index of the address whose balances you want to retrieve.

#### Returns

\- \`Promise\<Drc20BalData\>\`: An object containing DRC20 balances.

#### Usage Example

```
const balances = await getDrc20Balance({ addressIndex: 0 });
console.log(`DRC20 Balances:`, balances);
```

### getDrc20Info

Retrieve information about a specific DRC20 token.

#### Parameters

\- \`params\` (object):
  \- \`ticker\` (string): The ticker symbol of the DRC20 token.

#### Returns

\- \`Promise\<Drc20Info\>\`: An object containing information about the DRC20 token.

#### Usage Example

```
const tokenInfo = await getDrc20Info({ ticker: 'MYTOKEN' });
console.log(`DRC20 Token Info:`, tokenInfo);
```

## Notes

\- All methods are asynchronous and return Promises.
\- Ensure that you handle errors appropriately by using try-catch blocks or \`.catch()\` methods.
\- Before broadcasting transactions, make sure to get user confirmations where necessary.
\- The \`addressIndex\` parameter is crucial for methods that require access to a private key or address. Ensure that you use the correct index.
\- For methods that involve fees, the fee rate is fetched automatically, but users are prompted to confirm before proceeding.

## DISCLAIMER

THIS SOFTWARE IS PROVIDED "AS IS," WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. IN NO EVENT SHALL DOGGYFI, ITS EMPLOYEES, CONTRACTORS, DIRECTORS, OFFICERS, SHAREHOLDERS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR OTHER INTANGIBLES, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF THIS SOFTWARE, WHETHER OR NOT ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

BY USING THIS SOFTWARE, YOU AGREE TO FULLY INDEMNIFY, DEFEND, AND HOLD HARMLESS DOGGYFI, ITS EMPLOYEES, CONTRACTORS, DIRECTORS, OFFICERS, SHAREHOLDERS, AND AFFILIATES FROM AND AGAINST ANY AND ALL CLAIMS, DEMANDS, CAUSES OF ACTION, LOSSES, LIABILITIES, DAMAGES, COSTS, OR EXPENSES (INCLUDING ATTORNEYS' FEES) ARISING FROM OR IN CONNECTION WITH YOUR USE, MISUSE, OR INABILITY TO USE THE SOFTWARE, INCLUDING ANY VIOLATION OF THIS DISCLAIMER OR APPLICABLE LAW.
