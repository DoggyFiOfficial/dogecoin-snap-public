// Inscription functions for Doginals, forked over from apezord's original doginals implementation
const dogecore = require('bitcore-lib-doge');
const { PrivateKey, Address, Transaction, Script, Opcode } = dogecore;
const { Hash, Signature } = dogecore.crypto;

const MAX_CHUNK_LEN = 240;
const MAX_PAYLOAD_LEN = 1500;

function bufferToChunk(b, type) {
  b = Buffer.from(b, type);
  return {
    buf: b.length ? b : undefined,
    len: b.length,
    opcodenum: b.length <= 75 ? b.length : b.length <= 255 ? 76 : 77,
  };
}

function numberToChunk(n) {
  return {
    buf:
      n <= 16
        ? undefined
        : n < 128
        ? Buffer.from([n])
        : Buffer.from([n % 256, n / 256]),
    len: n <= 16 ? 0 : n < 128 ? 1 : 2,
    opcodenum: n == 0 ? 0 : n <= 16 ? 80 + n : n < 128 ? 1 : 2,
  };
}

function opcodeToChunk(op) {
  return { opcodenum: op };
}

function fund(wallet, tx) {
  tx.change(wallet.address);
  delete tx._fee;

  for (const utxo of wallet.utxos) {
    if (
      tx.inputs.length &&
      tx.outputs.length &&
      tx.inputAmount >= tx.outputAmount + tx.getFee()
    ) {
      break;
    }

    delete tx._fee;
    tx.from(utxo);
    tx.change(wallet.address);
    tx.sign(wallet.privkey);
  }

  if (tx.inputAmount < tx.outputAmount + tx.getFee()) {
    throw new Error('not enough funds');
  }
}

function updateWallet(wallet, tx) {
  wallet.utxos = wallet.utxos.filter((utxo) => {
    for (const input of tx.inputs) {
      if (
        input.prevTxId.toString('hex') == utxo.txid &&
        input.outputIndex == utxo.vout
      ) {
        return false;
      }
    }
    return true;
  });

  tx.outputs.forEach((output, vout) => {
    if (output.script.toAddress().toString() == wallet.address) {
      wallet.utxos.push({
        txid: tx.hash,
        vout,
        script: output.script.toHex(),
        satoshis: output.satoshis,
      });
    }
  });
}

// modified to take privateKey (base58 buffer) and publicKey (hex string) as arguments
// drops wallet.json updates from original implementation
export function inscribe(wallet, address, contentType, data) {
  let txs = [];

  let privateKey = new PrivateKey(wallet.privkey);
  let publicKey = privateKey.toPublicKey();

  let parts = [];
  while (data.length) {
    let part = data.slice(0, Math.min(MAX_CHUNK_LEN, data.length));
    data = data.slice(part.length);
    parts.push(part);
  }

  let inscription = new Script();
  inscription.chunks.push(bufferToChunk('ord'));
  inscription.chunks.push(numberToChunk(parts.length));
  inscription.chunks.push(bufferToChunk(contentType));
  parts.forEach((part, n) => {
    inscription.chunks.push(numberToChunk(parts.length - n - 1));
    inscription.chunks.push(bufferToChunk(part));
  });

  let p2shInput;
  let lastLock;
  let lastPartial;

  while (inscription.chunks.length) {
    let partial = new Script();

    if (txs.length == 0) {
      partial.chunks.push(inscription.chunks.shift());
    }

    while (
      partial.toBuffer().length <= MAX_PAYLOAD_LEN &&
      inscription.chunks.length
    ) {
      partial.chunks.push(inscription.chunks.shift());
      partial.chunks.push(inscription.chunks.shift());
    }

    if (partial.toBuffer().length > MAX_PAYLOAD_LEN) {
      inscription.chunks.unshift(partial.chunks.pop());
      inscription.chunks.unshift(partial.chunks.pop());
    }

    let lock = new Script();
    lock.chunks.push(bufferToChunk(publicKey.toBuffer()));
    lock.chunks.push(opcodeToChunk(Opcode.OP_CHECKSIGVERIFY));
    partial.chunks.forEach(() => {
      lock.chunks.push(opcodeToChunk(Opcode.OP_DROP));
    });
    lock.chunks.push(opcodeToChunk(Opcode.OP_TRUE));

    let lockhash = Hash.ripemd160(Hash.sha256(lock.toBuffer()));

    let p2sh = new Script();
    p2sh.chunks.push(opcodeToChunk(Opcode.OP_HASH160));
    p2sh.chunks.push(bufferToChunk(lockhash));
    p2sh.chunks.push(opcodeToChunk(Opcode.OP_EQUAL));

    let p2shOutput = new Transaction.Output({
      script: p2sh,
      satoshis: 100000,
    });

    let tx = new Transaction();
    if (p2shInput) tx.addInput(p2shInput);
    tx.addOutput(p2shOutput);
    fund(wallet, tx);

    if (p2shInput) {
      let signature = Transaction.sighash.sign(
        tx,
        privateKey,
        Signature.SIGHASH_ALL,
        0,
        lastLock,
      );
      let txsignature = Buffer.concat([
        signature.toBuffer(),
        Buffer.from([Signature.SIGHASH_ALL]),
      ]);

      let unlock = new Script();
      unlock.chunks = unlock.chunks.concat(lastPartial.chunks);
      unlock.chunks.push(bufferToChunk(txsignature));
      unlock.chunks.push(bufferToChunk(lastLock.toBuffer()));
      tx.inputs[0].setScript(unlock);
    }

    updateWallet(wallet, tx);
    txs.push(tx);

    p2shInput = new Transaction.Input({
      prevTxId: tx.hash,
      outputIndex: 0,
      output: tx.outputs[0],
      script: '',
    });

    p2shInput.clearSignatures = () => {};
    p2shInput.getSignatures = () => {};

    lastLock = lock;
    lastPartial = partial;
  }

  let tx = new Transaction();
  tx.addInput(p2shInput);
  tx.to(address, 100000);
  fund(wallet, tx);

  let signature = Transaction.sighash.sign(
    tx,
    privateKey,
    Signature.SIGHASH_ALL,
    0,
    lastLock,
  );
  let txsignature = Buffer.concat([
    signature.toBuffer(),
    Buffer.from([Signature.SIGHASH_ALL]),
  ]);

  let unlock = new Script();
  unlock.chunks = unlock.chunks.concat(lastPartial.chunks);
  unlock.chunks.push(bufferToChunk(txsignature));
  unlock.chunks.push(bufferToChunk(lastLock.toBuffer()));
  tx.inputs[0].setScript(unlock);

  updateWallet(wallet, tx);
  txs.push(tx);

  let serialized = [];
  txs.forEach((tx) => {
    serialized.push(tx.uncheckedSerialize());
  });

  return serialized;
}
