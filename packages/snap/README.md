# DoggyFi Snap

For the full information and tutorial, consult the [README](https://sayfer.io/audits/metamask-snap-audit-report-for-doggyfi/).

## Features

The snap has the following features:

- Generate a single Dogecoin address
- Get the balance for that address
- Get the list of transactions for that address
- Send DOGE from that address to another address
- Send DRC-20 from that address to another address
- Send Dunes from that address to another address
- Mint DRC-20 tokens
- Mint transfer inscriptions for DRC-20 tokens
- Deploy DRC-20 tokens
- Send Doginals
- Inscribe Doginals
- Open Dunes
- Mint Dunes
- Send Dunes
- Get metadata for DRC tokens
- Get metadata for Dunes
- Get list of Dunes Tokens for Address


## Permissions

The snap requires the following [permissions](https://docs.metamask.io/snaps/reference/permissions/):

- `snap_dialog` - To display a popup requiring the user to confirm a Dogecoin transaction.
- `endowment:rpc` - To allow Dapps to communicate with the snap's RPC API
- `snap_getBip44Entropy` - To derive Testnet private keys from the MetaMask secret recovery phrase

## RPC API

The snap exposes the following from [RPC API](./src/rpc.ts):

- `doge_getAddress` - returns the single address of the wallet
- `doge_getTransactions` - returns a list of transactions for the address
- `doge_getBalance` - returns the balance for the address
- `doge_makeTransaction` - accepts a target address and amount in satoshis, and broadcasts a transaction to the network
- `doge_mintDrc20` - mints a drc20
- `doge_mintTransferDrc20` - mints a transfer inscription for a drc20 token
- `doge_sendDrc20` - sends a transfer inscription for a drc-20 token
- `doge_deployDrc20` - mints a deploy inscription for a drc-20 token
- `doge_sendDoginal` - accepts a utxo and vout for a doingal and spends it to a specified address
- `doge_signPsbt` - accepts a psbt and signs it with the specified private key
- `doge_pushPsbt` - accepts a psbt and broadcasts it to the network
- `doge_signMessage` - accepts a message and signs it with the specified private key
- `doge_verifyMessage` - accepts a message and a signature and verifies the signature
- `doge_sendDune` - sends a dune to a specified address
- `doge_openDune` - deploys an open dune transaction
- `doge_mintDune` - mints a dune
- `doge_splitDune` - splits a dune
- `doge_getDuneBalancesForAccount` - retrieves the dune balances for an account
- `doge_getDuneMetadata` - retrieves the dune metadata for a dune
- `doge_getDrc20Balance` - retrieves the drc20 balance for an address
- `doge_inscribeData` - inscribes data onto the dogecoin blockchain
