import dogecore from 'bitcore-lib-doge';
import { Flag, PushBytes, Tag } from './dunesClasses';
import { varIntEncode } from './varIntEncode';
import { constants } from './constants';

// Construct the OP_RETURN dune script with encoding of given values
const createScriptWithProtocolMsg = () => {
  // create an OP_RETURN script with the protocol message
  // TODO: INDENTIFIER should be a buffer OF OP_13 see: https://docs.ordinals.com/runes/specification.html
  return new dogecore.Script()
    .add('OP_RETURN')
    .add(Buffer.from(constants.IDENTIFIER));
};

/**
 * Constructs a dune script with given values.
 *
 * @param {*} etching - An etching object.
 * @param {*} pointer - A pointer (offset to a previous vout).
 * @param {*} cenotaph - A boolean flag to indicate cenotaph.
 * @param {*} edicts - An array of edicts.
 * @returns {dogecore.Script} A dune script with given values implemented via dogecore.Script.
 */
export function constructScript(
  etching = null,
  pointer = undefined,
  cenotaph = null,
  edicts = [],
) {
  const payload = [];

  if (etching) {
    // Setting flags for etching and minting
    let flags = Number(Flag.mask(Flag.Etch));
    if (etching.turbo) {
      flags |= Number(Flag.mask(Flag.Turbo)); // eslint-disable-line no-bitwise
    }

    if (etching.terms) {
      flags |= Number(Flag.mask(Flag.Terms)); // eslint-disable-line no-bitwise
    }
    Tag.encode(Tag.Flags, flags, payload);

    if (etching.dune) {
      Tag.encode(Tag.Dune, etching.dune, payload);
    }

    if (etching.terms) {
      if (etching.terms.limit) {
        Tag.encode(Tag.Limit, etching.terms.limit, payload);
      }

      if (etching.terms.cap) {
        Tag.encode(Tag.Cap, etching.terms.cap, payload);
      }

      if (etching.terms.offsetStart) {
        Tag.encode(Tag.OffsetStart, etching.terms.offsetStart, payload);
      }

      if (etching.terms.offsetEnd) {
        Tag.encode(Tag.OffsetEnd, etching.terms.offsetEnd, payload);
      }

      if (etching.terms.heightStart) {
        Tag.encode(Tag.HeightStart, etching.terms.heightStart, payload);
      }

      if (etching.terms.heightEnd) {
        Tag.encode(Tag.HeightEnd, etching.terms.heightEnd, payload);
      }
    }

    if (etching.divisibility !== 0) {
      Tag.encode(Tag.Divisibility, etching.divisibility, payload);
    }

    if (etching.spacers !== 0) {
      Tag.encode(Tag.Spacers, etching.spacers, payload);
    }

    if (etching.symbol) {
      Tag.encode(Tag.Symbol, etching.symbol, payload);
    }

    if (etching.premine) {
      Tag.encode(Tag.Premine, etching.premine, payload);
    }
  }

  if (pointer !== undefined) {
    Tag.encode(Tag.Pointer, pointer, payload);
  }

  if (cenotaph) {
    Tag.encode(Tag.Cenotaph, 0, payload);
  }

  if (edicts && edicts.length > 0) {
    payload.push(varIntEncode(Tag.Body));
    const sortedEdicts = edicts.slice().sort((a, b) => {
      const idA = BigInt(a.id);
      const idB = BigInt(b.id);

      if (idA < idB) {
        return -1;
      } else if (idA > idB) {
        return 1;
      }

      return 0;
    });
    let id = 0;

    for (const edict of sortedEdicts) {
      if (typeof edict.id === 'bigint') {
        payload.push(varIntEncode(edict.id - BigInt(id)));
      } else {
        payload.push(varIntEncode(edict.id - id));
      }
      payload.push(varIntEncode(edict.amount));
      payload.push(varIntEncode(edict.output));
      id = edict.id;
    }
  }

  // Create script with protocol message
  const script = createScriptWithProtocolMsg();

  // Flatten the nested arrays in the tuple representation
  const flattenedTuple = payload.flat();

  // Push payload bytes to script
  for (
    let i = 0;
    i < flattenedTuple.length;
    i += constants.MAX_SCRIPT_ELEMENT_SIZE
  ) {
    const chunk = flattenedTuple.slice(
      i,
      i + constants.MAX_SCRIPT_ELEMENT_SIZE,
    );
    const push = PushBytes.fromSliceUnchecked(chunk);
    script.add(Buffer.from(push.asBytes()));
  }

  return script;
}
