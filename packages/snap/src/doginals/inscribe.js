import dogecore from 'bitcore-lib-doge';

const { PrivateKey, Transaction, Script, Opcode } = dogecore;
const { Hash, Signature } = dogecore.crypto;

const MAX_CHUNK_LEN = 240;
const MAX_PAYLOAD_LEN = 1500;

/**
 * Converts a buffer to a chunk.
 *
 * @param {*} b - Buffer.
 * @param {*} type - Type.
 * @returns {*} Chunk.
 */
function bufferToChunk(b, type) {
  b = Buffer.from(b, type); // eslint-disable-line
  return {
    buf: b.length ? b : undefined,
    len: b.length,
    opcodenum: b.length <= 75 ? b.length : b.length <= 255 ? 76 : 77, // eslint-disable-line
  };
}

/**
 * Converts a number to a chunk.
 *
 * @param {*} n - The number to convert.
 * @returns {*} The chunk.
 */
function numberToChunk(n) {
  return {
    buf:
      n <= 16 // eslint-disable-line
        ? undefined
        : n < 128
        ? Buffer.from([n])
        : Buffer.from([n % 256, n / 256]),
    len: n <= 16 ? 0 : n < 128 ? 1 : 2, // eslint-disable-line
    opcodenum: n == 0 ? 0 : n <= 16 ? 80 + n : n < 128 ? 1 : 2, // eslint-disable-line
  };
}

/**
 * Converts an opcode to a chunk.
 *
 * @param {*} op - The opcode to convert.
 * @returns {*} The chunk.
 */
function opcodeToChunk(op) {
  return { opcodenum: op };
}

/**
 * Funds a transaction.
 *
 * @param {*} wallet - An Apezord wallet.
 * @param {*} tx - The transaction to fund.
 */
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

/**
 * Updates the wallet with the transaction.
 *
 * @param {*} wallet - An Apezord wallet.
 * @param {*} tx - The transaction to update the wallet with.
 */
function updateWallet(wallet, tx) {
  wallet.utxos = wallet.utxos.filter((utxo) => {
    for (const input of tx.inputs) {
      if (
        input.prevTxId.toString('hex') === utxo.txid &&
        input.outputIndex === utxo.vout
      ) {
        return false;
      }
    }
    return true;
  });

  tx.outputs.forEach((output, vout) => {
    if (output.script.toAddress().toString() === wallet.address) {
      wallet.utxos.push({
        txid: tx.hash,
        vout,
        script: output.script.toHex(),
        satoshis: output.satoshis,
      });
    }
  });
}

/**
 * Inscribes data.
 *
 * @param {*} wallet - An Apezord wallet.
 * @param {*} address - The address to inscribe the data to.
 * @param {*} contentType - The content type of the data.
 * @param {*} data - The data to inscribe.
 * @param {*} doggyfiFee - The doggyfi fee.
 * @param {*} doggyfiFeeAddress - The doggyfi fee address.
 * @returns {*} The serialized transactions and the total fees.
 */
export function inscribe(
  wallet,
  address,
  contentType,
  data,
  doggyfiFee,
  doggyfiFeeAddress,
) {
  const txs = [];

  const privateKey = new PrivateKey(wallet.privkey);
  const publicKey = privateKey.toPublicKey();

  const parts = [];
  while (data.length) {
    const part = data.slice(0, Math.min(MAX_CHUNK_LEN, data.length));
    data = data.slice(part.length); // eslint-disable-line
    parts.push(part);
  }

  const inscription = new Script();
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
    const partial = new Script();

    if (txs.length === 0) {
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

    const lock = new Script();
    lock.chunks.push(bufferToChunk(publicKey.toBuffer()));
    lock.chunks.push(opcodeToChunk(Opcode.OP_CHECKSIGVERIFY));
    partial.chunks.forEach(() => {
      lock.chunks.push(opcodeToChunk(Opcode.OP_DROP));
    });
    lock.chunks.push(opcodeToChunk(Opcode.OP_TRUE));

    const lockhash = Hash.ripemd160(Hash.sha256(lock.toBuffer()));

    const p2sh = new Script();
    p2sh.chunks.push(opcodeToChunk(Opcode.OP_HASH160));
    p2sh.chunks.push(bufferToChunk(lockhash));
    p2sh.chunks.push(opcodeToChunk(Opcode.OP_EQUAL));

    const p2shOutput = new Transaction.Output({
      script: p2sh,
      satoshis: 100000,
    });

    const tx = new Transaction();
    if (p2shInput) {
      tx.addInput(p2shInput);
    }
    tx.addOutput(p2shOutput);
    fund(wallet, tx);

    if (p2shInput) {
      const signature = Transaction.sighash.sign(
        tx,
        privateKey,
        Signature.SIGHASH_ALL,
        0,
        lastLock,
      );
      const txsignature = Buffer.concat([
        signature.toBuffer(),
        Buffer.from([Signature.SIGHASH_ALL]),
      ]);

      const unlock = new Script();
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

    p2shInput.clearSignatures = () => {
      // Intentionally left blank as no operation is needed
    };

    p2shInput.getSignatures = () => {
      // Intentionally left blank as no operation is needed
    };

    lastLock = lock;
    lastPartial = partial;
  }

  const tx = new Transaction();
  tx.addInput(p2shInput);
  tx.to(address, 100000);
  tx.to(doggyfiFeeAddress, doggyfiFee); // doggyfi fee for api costs
  fund(wallet, tx);

  const signature = Transaction.sighash.sign(
    tx,
    privateKey,
    Signature.SIGHASH_ALL,
    0,
    lastLock,
  );
  const txsignature = Buffer.concat([
    signature.toBuffer(),
    Buffer.from([Signature.SIGHASH_ALL]),
  ]);

  const unlock = new Script();
  unlock.chunks = unlock.chunks.concat(lastPartial.chunks);
  unlock.chunks.push(bufferToChunk(txsignature));
  unlock.chunks.push(bufferToChunk(lastLock.toBuffer()));
  tx.inputs[0].setScript(unlock);

  updateWallet(wallet, tx);
  txs.push(tx);

  const serialized = [];
  txs.forEach((_tx) => {
    serialized.push(_tx.uncheckedSerialize());
  });

  let totalFees = 0;
  txs.forEach((_tx) => {
    totalFees += _tx.inputAmount - _tx.outputAmount;
  });

  return { serialized, totalFees };
}
