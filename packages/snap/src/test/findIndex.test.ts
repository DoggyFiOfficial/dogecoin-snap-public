// Define the types
import { getSatRange } from '../find-ord-index';

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

type ScriptPubKey = {
  asm: string;
  hex: string;
  reqSigs: number;
  type: string;
  addresses: string[];
};

type RPCVout = {
  value: number;
  n: number;
  scriptPubKey: ScriptPubKey;
};

type RPCTransaction = {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  locktime: number;
  vin: RPCVin[];
  vout: RPCVout[];
  hex: string;
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
};

let transaction: RPCTransaction;
describe('getSatRange', () => {
  beforeAll(() => {
    // JSON string
    const jsonString1 =
      '{"data":{"blockhash":"69e11560b0aa268f033ca0975b65f5e773c8331f2919a96e06c702d706964fe8","blocktime":1721243187,"confirmations":5563,"hash":"1225e74ac811fe24d5fd26c5ebfc9db6cb32dbcac439216b318bd41fdee7cb19","hex":"01000000027a4289f2cc41dd2f3a535d05b586a98109b37ae350214dbc99e0cef7766c17f100000000ca036f72645118746578742f706c61696e3b636861727365743d7574662d3800377b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a2274666c6e222c22616d74223a223530227d483045022100e4dc2aa0c8c491259b053282df374a0277532d22cf1130efbe631998469758ba02207e77aba12bcb94f9f990ab2f9dddb812c5b6e0f3ae6ad4ab5d390f0bb62d8476012921032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ad757575757551ffffffff7a4289f2cc41dd2f3a535d05b586a98109b37ae350214dbc99e0cef7766c17f1010000006b483045022100d0e6fb08d56f3817b1725531f5c456c4f82be0a45d2b81be9dbe285742e6e42502204f05f56ba419a984b0a4cbe04ed16062a462f654319dbc3f6651ebf7a154d5870121032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ffffffff02a0860100000000001976a914b4f0f8bef214b00c7987efc4138e6cc6afd573a788ac9b4a58b5010000001976a914b4f0f8bef214b00c7987efc4138e6cc6afd573a788ac00000000","locktime":0,"size":469,"time":1721243187,"txid":"1225e74ac811fe24d5fd26c5ebfc9db6cb32dbcac439216b318bd41fdee7cb19","version":1,"vin":[{"scriptSig":{"asm":"6582895 1 746578742f706c61696e3b636861727365743d7574662d38 0 7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a2274666c6e222c22616d74223a223530227d 3045022100e4dc2aa0c8c491259b053282df374a0277532d22cf1130efbe631998469758ba02207e77aba12bcb94f9f990ab2f9dddb812c5b6e0f3ae6ad4ab5d390f0bb62d8476[ALL] 21032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ad757575757551","hex":"036f72645118746578742f706c61696e3b636861727365743d7574662d3800377b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a2274666c6e222c22616d74223a223530227d483045022100e4dc2aa0c8c491259b053282df374a0277532d22cf1130efbe631998469758ba02207e77aba12bcb94f9f990ab2f9dddb812c5b6e0f3ae6ad4ab5d390f0bb62d8476012921032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ad757575757551"},"sequence":4294967295,"txid":"f1176c76f7cee099bc4d2150e37ab30981a986b5055d533a2fdd41ccf289427a","vout":0},{"scriptSig":{"asm":"3045022100d0e6fb08d56f3817b1725531f5c456c4f82be0a45d2b81be9dbe285742e6e42502204f05f56ba419a984b0a4cbe04ed16062a462f654319dbc3f6651ebf7a154d587[ALL] 032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93","hex":"483045022100d0e6fb08d56f3817b1725531f5c456c4f82be0a45d2b81be9dbe285742e6e42502204f05f56ba419a984b0a4cbe04ed16062a462f654319dbc3f6651ebf7a154d5870121032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93"},"sequence":4294967295,"txid":"f1176c76f7cee099bc4d2150e37ab30981a986b5055d533a2fdd41ccf289427a","vout":1}],"vout":[{"n":0,"scriptPubKey":{"addresses":["DMdpqnvebKF2GtBTZQdZ6SDW4Cf7ywVkKw"],"asm":"OP_DUP OP_HASH160 b4f0f8bef214b00c7987efc4138e6cc6afd573a7 OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914b4f0f8bef214b00c7987efc4138e6cc6afd573a788ac","reqSigs":1,"type":"pubkeyhash"},"value":0.001},{"n":1,"scriptPubKey":{"addresses":["DMdpqnvebKF2GtBTZQdZ6SDW4Cf7ywVkKw"],"asm":"OP_DUP OP_HASH160 b4f0f8bef214b00c7987efc4138e6cc6afd573a7 OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914b4f0f8bef214b00c7987efc4138e6cc6afd573a788ac","reqSigs":1,"type":"pubkeyhash"},"value":73.37429659}],"vsize":469},"last_updated":{"block_hash":"2d47fd8809ce4ecc3b1762e50a9b195488b21f33c582b3424c287297761fc200","block_height":5303923}}';

    // Parse the JSON string
    const jsonObject = JSON.parse(jsonString1);

    // Extract the data and map it to the desired structure
    const { data } = jsonObject;

    transaction = {
      txid: data.txid,
      hash: data.hash,
      version: data.version,
      size: data.size,
      vsize: data.vsize,
      locktime: data.locktime,
      vin: data.vin.map((vinItem: any) => ({
        txid: vinItem.txid,
        vout: vinItem.vout,
        scriptSig: {
          asm: vinItem.scriptSig.asm,
          hex: vinItem.scriptSig.hex,
        },
        sequence: vinItem.sequence,
      })),
      vout: data.vout.map((voutItem: any) => ({
        value: voutItem.value,
        n: voutItem.n,
        scriptPubKey: {
          asm: voutItem.scriptPubKey.asm,
          hex: voutItem.scriptPubKey.hex,
          reqSigs: voutItem.scriptPubKey.reqSigs,
          type: voutItem.scriptPubKey.type,
          addresses: voutItem.scriptPubKey.addresses,
        },
      })),
      hex: data.hex,
      blockhash: data.blockhash,
      confirmations: data.confirmations,
      time: data.time,
      blocktime: data.blocktime,
    };
  });

  it('should return index 0 as the start and end index for tx1', async () => {
    const { startIndex, endIndex } = await getSatRange(
      transaction,
      'DMdpqnvebKF2GtBTZQdZ6SDW4Cf7ywVkKw',
      '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a2274666c6e222c22616d74223a223530227d',
    );
    expect(startIndex).toBe(0);
    expect(endIndex).toBe(0);
  });

  // TODO, ADD TEST CASES WITH INSCRIPTION MADE ON 1+ UTXO
  // TODO, ADD TEST CASES FOR POINTERS
});
