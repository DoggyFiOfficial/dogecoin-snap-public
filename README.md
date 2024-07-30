# DoggyFi's Dogecoin & Doginals Snap 🐶

If you are looking to trade doginals and/or dogecoin, and are coming from other ecoystems, or just love metamask, then this is the snap for you! This open-source snap, created by DoggyFi, allows you not only to trade dogecoin, but also your favorite doginal assets (including token metaprotocols such as DRC-20, and more coming soon!)

For the technically inclined user, this readme will explain to you how you can set up the DoggyFi snap locally to do testing and build upon it yourself.

Let's get started! 🎢🚀

## Pre-work

If this is your first time developing with Snaps, take a look at the [Snaps introduction](https://docs.metamask.io/snaps/) and [Snaps Getting Started Guide](https://docs.metamask.io/snaps/category/get-started/) before diving into this tutorial.

## Install and starting the snap
Everything you need to get started is contained in the snap. To set up the snap, please do the following:
1. `yarn install`  
2. `yarn build` 

In testing we used node v22.3.0, and yarn 3.2.1

To start the snap simply run `yarn start`. After the script finishes runnning you should see be able to view the gatsby app by loading `http://localhost:8000/`

## Snap overview

Let's take a look at what you can do with DoggyFi's snap.

### 1. Send & Receive Dogecoin!
The snap allows you to both send and receive dogecoin using metamask. When you open your snap, by default it will derive the the first (0th) wallet using Bip44Entropy on the 3rd coin path. This is m/44'/3'/0'/0/0 to be specific, which is the same default derivation path such as other major wallets (e.g., dogelabs and mydoge). This means that given the same seed phrase, doggyfi's snap wallet will derive the same wallets that you'd expect from your other favorite wallets, all you have to do is use the same seed phrase!

Sending or receiving doge from the snap is pretty simple.
1. If you haven't already, install metamask flask `https://chromewebstore.google.com/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk?hl=en`
1. Connect to `http://localhost:8000/`  
2. Click on `Reconnect` or `Install Snap`, follow the instructions on the prompts to install the snap  

#### To send Doge
1. Provide the dogecoin address and amount in DOGE under `Send DOGE`, follow instructions

#### To receive Doge
1. Under `Dogecoin Address`, then copy the address displayed. Provide this as your Doge address

*Note that currently the snap only uses the dogecoin wallet on the 0th path, or your first address, in a subsequent improvement, we will add support for wallet's beyond path 0*

### 2. Send & Receive Doginals!
Version 0.1.0 of the snap provides the following methods for doginals

#### Send Doginal (Ordinal) Inscription
Arbitrary doginals, which are ordinals, can be sent from account A to account B by simply spending the utxo. This function allows to send an arbitrary doginal by providing the transaction hash and vout of that doginal to a specific receiving address.

Under the card titled `Send Doginal (Ordinal) Inscription` you have three fields provided
1. Destination address -- the dogecoin address where you want to receive the ordinal
2. Transfer inscription UTXO -- The transaction hash that holds the utxo associated with the inscription  
3. Vout index -- Default 0, optional to specify something different. 99%+ of the time the ordinal will be on the 0th output, but in the event of an alternative usage, example pointers, you can specify a different vout (1+)

*We know that this flow is not ideal, as it requires you to know the precise utxo on your wallet that holds the inscription. In an upcoming improvement, and prior to our V1.0 release, we will add support to show what doginals sit in which UTXOs are on the wallet.*

### 3. Send & Receive, deploy, mint, transfer DRC-20!
The doggyfi doginals snap allows you not only to self-custody DRC-20 assets in a snap, but also to deploy, mint, transfer them as well.

#### Receiving DRC-20 assets
This one is quite simple. All you need to do is provide the person which you are requesting a DRC-20 your DOGE address from the snap.

#### Deploy DRC-20
On the snap, scroll to `Deploy Token`, and fill out the fields:
1. `DRC-20 Addres`: This is just the doge address you want the deploy inscription to go to.
2. `DRC-20 Token Ticker`: A stricly 4 letter lower case combination of 4 utf-8 characters for your symbol (*) 
3. `Max supply of token`: The maximum number of tokens, limited to int64_max
4. `Max mint limit (optional)`: The maximum number of tokens allowed on a single mint
5. `Decimals`: How many decimals are allowed using the int_64 supply number as an approximation to a float (**)

*(\*) You should check other public marketplaces to verify the DRC-20 symbol is available. In a future improvement, we will include a service to verify the availability of a symbol before deployment*
*(\*) While decimals are part of the official BRC-20 spec, it should be noted that the majority of DRC-20 marketplaces don't seem to respect this field, thus we reccomend leaving it blank*

#### Mint DRC-20
On the snap, scroll to `Mint Transfer Inscription / Make Token Amount Transferable`, and fill out the fields:
1. `DRC-20 Token Ticker`: Ticker to mint (*)
2. `Amount`: The amount of the token to mint
3. `Address`: The address to mint the token to

*(\*) You should verify the token isn't minted out before doing this. In a future improvement, we will offer an endpoint to pre-validate mint inscriptions before they are sent*

#### Mint Transfer Inscription / Make Token Amount Transferable
On the snap, scroll to `Mint Transfer Inscription / Make Token Amount Transferable` and fill out the fields:
1. `DRC-20 Token Ticker`: Ticker of token to make transferable (*)  
2. `Amount`: Amount of the token to make transferable (**)
3. `Your address here`: You should put your doge address here, or the address that holds an available balance

*(\*) You should make sure you have an available balance of this token FIRST. In a future version, we will include this info in the snap*
*(\*\*) You should ensure that this is less than your available balance of the token*

#### Transfer DRC-20
On the snap, scroll to `Send Transfer Inscription`, and fill out the fields:
1. `DRC-20 token ticker`: Ticker to transfer (*)
2. `Amount`: The amount of the transfer inscription to send (**)
3. `Destination Address`: The doge address to send the DRC-20 token to
4. `Transfer Inscription UTXO (Optional)`: The utxo of that the transfer inscription was minted on (***)

*(\*) Before sending a transfer inscription, you must mint a transfer inscription first, if there are no other transferable transfer inscriptions*
*(\*\*) This amount should exactly match the amount minted in a previously generated transfer inscription*
*(\*\*\*) If provided the UTXO is supported instead, as long as the transfer inscription lives on vout 0. In a future version, we will support transfers inscriptions made on vouts beyond 0*

### 4. Send & Receive Dunes, send & Receive, deploy, mint (Coming Soon)!
Coming soon, stay tuned!

### 5. Make Custom Doginals (Coming Soon!)
Coming soon, stay tuned!

## A note on the API's and fee's added to TXs
DoggyFi is providing, for the communities benefit, and to enable the snap to function accross many ecosystems, public endpoints with a 5 request per minute rate limit per I.P..

As these endpoints cost DoggyFi money to be able to offer, DoggyFi will attach a small fee in DOGE to each transaction, based on it's API usage, to compensate DoggyFi to compensate DoggyFi for the cost of providing these endpoints. Right now we are proposing a reasonable 0.1 DOGE per tx, the final number will be pinned shortly before launching on Metamask's public app store.

## Upcoming improvements
A succinct list of improvements, are listed below:

1. Support for wallets beyond path 0 - The snap currently only uses the dogecoin wallet on the 0th path. Future updates will add support for wallets beyond path 0.
2. Show doginals in UTXOs - Improvement to show which doginals are in which UTXOs on the wallet.
3. DRC-20 symbol availability check - Service to verify the availability of a DRC-20 symbol before deployment.
4. Pre-validation of mint inscriptions - Endpoint to pre-validate mint inscriptions before they are sent.
5. Display available balance of tokens - The snap will include information about available balances of tokens before making them transferable.
6. Support for transfer inscriptions on vouts beyond 0 - Future versions will support transfer inscriptions made on vouts beyond 0.
7. Send & Receive Dunes - Coming soon feature.
8. Deploy, mint Dunes - Coming soon feature.
9. Make Custom Doginals - Coming soon feature.
