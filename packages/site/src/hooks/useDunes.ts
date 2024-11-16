import { useState } from 'react';
import { sendDune, openDune, mintDune, splitDune } from '../utils';

export const useSendDune = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setResult] = useState<any | null>(null);

  const _sendDune = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const addressIndex = Number(data.get('addressIndex'));
    const toAddress = String(data.get('toAddress'));
    const amount = data.get('amount');
    const dune = String(data.get('dune'));

    const params = {
      addressIndex,
      toAddress,
      amount,
      dune,
    };

    try {
      const res = await sendDune(params);
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return {
    error,
    isLoading,
    lastTxId,
    _sendDune,
  };
};

export const useOpenDune = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setResult] = useState<any | null>(null);

  const _openDune = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const addressIndex = data.get('addressIndex');
      const toAddress = data.get('toAddress');
      const tick = data.get('tick');
      const symbol = data.get('symbol');
      let _limit = data.get('limit');
      let limit: string | null = null;
      if (_limit !== null) {
        limit = String(_limit);
      } else {
        limit = null;
      }
      const divisibility = data.get('divisibility');
      let _cap = data.get('cap');
      let cap: string | null = null;
      if (_cap !== null) {
        cap = String(_cap);
      } else {
        cap = null;
      }
      let _heightStart = data.get('heightStart');
      let heightStart: number | null = null;
      if (_heightStart !== null) {
        heightStart = Number(_heightStart);
        if (heightStart === 0) {
          heightStart = null;
        }
      }
      let _heightEnd = data.get('heightEnd');
      let heightEnd: number | null = null;
      if (_heightEnd !== null) {
        heightEnd = Number(_heightEnd);
        if (heightEnd === 0) {
          heightEnd = null;
        }
      }
      let _offsetStart = data.get('offsetStart');
      let offsetStart: number | null = null;
      if (_offsetStart !== null) {
        offsetStart = Number(_offsetStart);
        if (offsetStart === 0) {
          offsetStart = null;
        }
      }
      let _offsetEnd = data.get('offsetEnd');
      let offsetEnd: number | null = null;
      if (_offsetEnd !== null) {
        offsetEnd = Number(_offsetEnd);
        if (offsetEnd === 0) {
          offsetEnd = null;
        }
      }
      const premine = data.get('premine');
      const turbo = data.get('turbo');
      const openMint = data.get('openMint');
      const params = {
        addressIndex: Number(addressIndex),
        toAddress: String(toAddress),
        tick: String(tick),
        symbol: String(symbol),
        limit: limit,
        divisibility: Number(divisibility),
        cap: cap,
        heightStart: heightStart,
        heightEnd: heightEnd,
        offsetStart: offsetStart,
        offsetEnd: offsetEnd,
        premine: String(premine),
        turbo: String(turbo) == 'true',
        openMint: String(openMint) == 'true',
      };

      const res = await openDune(params);
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return {
    error,
    isLoading,
    lastTxId,
    _openDune,
  };
};

export const useMintDunes = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setResult] = useState<any | null>(null);

  const _mintDune = async (data: FormData) => {
    setLoading(true);
    setError(null);
    const addressIndex = data.get('addressIndex');
    const id = data.get('id');
    const _amount = data.get('amount');
    const receiver = data.get('receiver');

    const params = {
      addressIndex: Number(addressIndex),
      id: String(id),
      amount: String(_amount),
      receiver: String(receiver),
    };

    try {
      const res = await mintDune(params);
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return {
    error,
    isLoading,
    lastTxId,
    _mintDune,
  };
};

export const useSplitDunes = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setResult] = useState<any | null>(null);

  const _splitDunes = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const addressIndex = data.get('addressIndex');
    const txhash = data.get('txhash');
    const vout = data.get('vout');
    const dune = data.get('dune');
    const decimals = data.get('decimals');
    const amounts_csv = String(data.get('amounts'));
    // split amounts_csv into an array of strings
    let amounts = amounts_csv.split(',');
    // split addresses_csv into an array of strings
    let addresses_csv = String(data.get('addresses'));
    let addresses = [];
    for (let i = 0; i < addresses_csv.length; i++) {
      addresses.push(String(addresses_csv[i]));
    }

    const params = {
      addressIndex: Number(addressIndex),
      txhash: String(txhash),
      vout: Number(vout),
      dune: String(dune),
      decimals: Number(decimals),
      amounts: amounts,
      addresses: addresses,
    };

    try {
      const res = await splitDune(params);
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return {
    error,
    isLoading,
    lastTxId,
    _splitDunes,
  };
};
