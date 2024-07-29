// Helper function to determine which outputs have an inscription based on pointers...
type ScriptSig = {
  asm: string;
  hex: string;
};

type RPCVin = {
  txid: string;
  vout: number;
  scriptSig: ScriptSig;
  sequence: number;
};

/**
 * Find ordinal content from RPC Transaction.
 *
 * @param asm - The asm array.
 * @returns Mapping of content's "contentType", "content", "hasPointer", "pointer" values.
 */
export function findContent(asm: string[]): {
  contentType: string;
  content: string;
  hasPointer: boolean;
  pointer: string;
} {
  try {
    // Ensure the asm starts with the expected prefix
    if (asm[0] !== '6582895') {
      return { contentType: '', content: '', hasPointer: false, pointer: '' };
    }

    // Find the first "1"
    let index = asm.indexOf('1');
    if (index === -1) {
      return { contentType: '', content: '', hasPointer: false, pointer: '' };
    }

    // The content type is between "1" and "0", right after the first "1"
    const contentType = asm[index + 1];

    let hasPointer = false;
    let pointer = '';

    // find 0 and the pointer
    for (let i = index + 2; i < asm.length; i++) {
      if (asm[i] === '2') {
        hasPointer = true;
        pointer = asm[i + 1];
      }

      if (asm[i] === '0') {
        index = i;
        break;
      }
    }

    // Ensure we found "0"
    if (asm[index] !== '0') {
      throw new Error('OP_PUSH 0 not found after content type');
    }

    // The content is the next string after "0"
    const content = asm[index + 1];

    return { contentType, content, hasPointer, pointer };
  } catch (r) {
    console.error('find-content-error', 'reason', r);
    throw r;
  }
}

/**
 * Find doginal content from RPCVin.
 *
 * @param vin - The RPCVin object.
 * @returns Mapping of content's "contentType", "content", "hasPointer", "pointer" values.
 */
export async function getDoginalContent(vin: RPCVin): Promise<{
  contentType: string;
  content: string;
  hasPointer: boolean;
  pointer: string;
}> {
  try {
    const inputData = vin.scriptSig.hex;

    const raw = Buffer.from(inputData, 'hex');
    if (!raw) {
      throw new Error('error decoding hex');
    }

    const inscriptionMark = Buffer.from([0x03, 0x6f, 0x72, 0x64]);
    const mark = raw.slice(0, 4);

    if (!inscriptionMark.equals(mark)) {
      throw new Error('no ordinal inscription found in transaction');
    }

    const asms = vin.scriptSig.asm.split(' ');
    if (asms.length < 5) {
      throw new Error('asm too small');
    }

    return findContent(asms);
  } catch (r) {
    console.error('get-content-panic', 'reason: ', r);
    throw r;
  }
}
