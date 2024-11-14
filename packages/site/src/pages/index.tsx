import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getAddress,
  getBalance,
  getSnap,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
} from '../components';
import { useSendDoge } from '../hooks/useSendDoge';
import { useSendDoginals } from '../hooks/useDoginals';
import {
  useDeployDRC20,
  useMintDRC20,
  useMintTransferDRC20,
  useSendDRC20,
} from '../hooks/useDRC20';
import {
  useSendDune,
  useOpenDune,
  useMintDunes,
  useSplitDunes,
} from '../hooks/useDunes';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [ADDRESS, setAddress] = useState('');
  const [BALANCE, setBalance] = useState(0);
  const [ADDRESSINDEX, setAddressIndex] = useState(0);

  useEffect(() => {
    if (state.installedSnap) {
      fetchAddressAndBalance(ADDRESSINDEX);
    }
  }, [state.installedSnap, ADDRESSINDEX]);

  const fetchAddressAndBalance = async (index: number) => {
    try {
      const newAddress = await getAddress(index);
      const newBalance = await getBalance(index);
      setAddress(newAddress);
      setBalance(newBalance);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const {
    error: txError,
    isLoading: isTxLoading,
    lastTxId,
    sendDoge,
  } = useSendDoge();

  const {
    error: txErrorMintDRC20,
    isLoading: isTxLoadingMintDRC20,
    lastTxId: lastTxIdMintDRC20,
    _mintDrc20,
  } = useMintDRC20();

  const {
    error: txErrorMintTransferDRC20,
    isLoading: isTxLoadingMintTransferDRC20,
    lastTxId: lastTxIdMintTransferDRC20,
    _mintTransferDrc20,
  } = useMintTransferDRC20();

  const {
    error: txErrorDeployDRC20,
    isLoading: isTxLoadingDeployDRC20,
    lastTxId: lastTxIdDeployDRC20,
    _deployDrc20,
  } = useDeployDRC20();

  const {
    error: txErrorSendDoginal,
    isLoading: isTxLoadingSendDoginal,
    lastTxId: lastTxIdSendDoginal,
    _sendDoginal,
  } = useSendDoginals();

  const {
    error: txErrorSendDRC20,
    isLoading: isTxLoadingSendDRC20,
    lastTxId: lastTxIdSendDRC20,
    _sendDRC20,
  } = useSendDRC20();

  const {
    error: txErrorSendDune,
    isLoading: isTxLoadingSendDune,
    lastTxId: lastTxIdSendDune,
    _sendDune,
  } = useSendDune();

  const {
    error: txErrorOpenDune,
    isLoading: isTxLoadingOpenDune,
    lastTxId: lastTxIdOpenDune,
    _openDune,
  } = useOpenDune();

  const {
    error: txErrorMintDune,
    isLoading: isTxLoadingMintDune,
    lastTxId: lastTxIdMintDune,
    _mintDune,
  } = useMintDunes();

  const {
    error: txErrorSplitDunes,
    isLoading: isTxLoadingSplitDunes,
    lastTxId: lastTxIdSplitDunes,
    _splitDunes,
  } = useSplitDunes();

  const handleSwitchAccount: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    let addressIndex = Number.parseInt(String(formData.get('addressIndex')));
    if (addressIndex < 0) {
      throw new Error('Address index MUST be an integer >= 0');
    }
    setAddressIndex(addressIndex);
  };

  const handleSendDoge: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    sendDoge(formData);
  };

  const handleMintToken: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _mintDrc20(formData);
  };

  const handleMintTransferToken: React.FormEventHandler<
    HTMLFormElement
  > = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _mintTransferDrc20(formData);
  };

  const handleDeployDRC20: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _deployDrc20(formData);
  };

  const handleSendDoginal: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _sendDoginal(formData);
  };

  const handleSendDRC20: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _sendDRC20(formData);
  };

  const handleSendDune: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _sendDune(formData);
  };

  const handleOpenDune: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _openDune(formData);
  };

  const handleMintDune: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _mintDune(formData);
  };

  const handleSplitDunes: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('addressIndex', String(ADDRESSINDEX));
    _splitDunes(formData);
  };

  const isSnapInstalled = Boolean(state.installedSnap);

  return (
    <Container>
      <Heading>
        Welcome to <Span>DoggyFi's Doginals-Snap 🖖</Span>
      </Heading>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        {ADDRESS && (
          <Card
            fullWidth
            content={{
              title: 'Your Dogecoin Address',
              description: ADDRESS,
            }}
          />
        )}
        {BALANCE !== undefined && (
          <Card
            fullWidth
            content={{
              title: 'Your Dogecoin Balance',
              description: `${BALANCE} DOGE`,
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Change Account',
              description: (
                <>
                  <form onSubmit={handleSwitchAccount}>
                    <p>
                      <input
                        type="number"
                        name="addressIndex"
                        placeholder="0"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoading} type="submit">
                      Switch account
                    </button>
                  </form>
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Send DOGE',
              description: (
                <>
                  <form onSubmit={handleSendDoge}>
                    <p>
                      <input
                        type="text"
                        name="toAddress"
                        placeholder="Address"
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="amountInDoge"
                        placeholder="Amount in DOGE"
                      />
                    </p>
                    <button disabled={isTxLoading} type="submit">
                      Send DOGE
                    </button>
                  </form>
                  {lastTxId && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://sochain.com/tx/DOGE/${lastTxId}`}
                      >
                        {lastTxId}
                      </a>
                    </p>
                  )}
                  {txError && <ErrorMessage>{txError}</ErrorMessage>}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Mint DRC-20 Token',
              description: (
                <>
                  <form onSubmit={handleMintToken}>
                    <p>
                      <input
                        type="text"
                        name="toAddress"
                        placeholder="Your DRC-20 Address here."
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="text"
                        name="ticker"
                        placeholder="DRC-20 Token Ticker"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount in Token"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingMintDRC20} type="submit">
                      Mint DRC-20 Token
                    </button>
                  </form>
                  {lastTxIdMintDRC20 && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://sochain.com/tx/DOGE/${lastTxIdMintDRC20}`}
                      >
                        {lastTxIdMintDRC20}
                      </a>
                    </p>
                  )}
                  {txErrorMintDRC20 && (
                    <ErrorMessage>{txErrorMintDRC20}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Deploy DRC-20 Token',
              description: (
                <>
                  <form onSubmit={handleDeployDRC20}>
                    <p>
                      <input
                        type="text"
                        name="toAddress"
                        placeholder="Your DRC-20 Address here."
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="text"
                        name="ticker"
                        placeholder="DRC-20 Token Ticker"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="maxSupply"
                        placeholder="Max supply of token (limited to int64_max)"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="lim"
                        placeholder="Optional: Max number of tokens in single mint (limited to int64_max)"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="decimals"
                        placeholder="Optional: Number of decimals for token, max 18"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingDeployDRC20} type="submit">
                      Deploy DRC-20 Token
                    </button>
                  </form>
                  {lastTxIdDeployDRC20 && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://sochain.com/tx/DOGE/${lastTxIdDeployDRC20}`}
                      >
                        {lastTxIdDeployDRC20}
                      </a>
                    </p>
                  )}
                  {txErrorDeployDRC20 && (
                    <ErrorMessage>{txErrorDeployDRC20}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title:
                'Mint DRC-20 Transfer Inscription / Make DRC-20 Token Amount Transferable',
              description: (
                <>
                  <form onSubmit={handleMintTransferToken}>
                    <p>
                      <input
                        type="text"
                        name="ticker"
                        placeholder="DRC-20 Token Ticker"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount in Token"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="toAddress"
                        placeholder="Your address here"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button
                      disabled={isTxLoadingMintTransferDRC20}
                      type="submit"
                    >
                      Make DRC-20 Transfer Inscription
                    </button>
                  </form>
                  {lastTxIdMintTransferDRC20 && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://sochain.com/tx/DOGE/${lastTxIdMintTransferDRC20}`}
                      >
                        {lastTxIdMintTransferDRC20}
                      </a>
                    </p>
                  )}
                  {txErrorMintTransferDRC20 && (
                    <ErrorMessage>{txErrorMintTransferDRC20}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Send Doginal (Ordinal) Inscription',
              description: (
                <>
                  <form onSubmit={handleSendDoginal}>
                    <p>
                      <input
                        type="string"
                        name="toAddress"
                        placeholder="Destination Address"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="utxo"
                        placeholder="Transfer Inscription UTXO"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="outputIndex"
                        placeholder="0"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingSendDoginal} type="submit">
                      Send Doginal (Ordinal) Inscription
                    </button>
                  </form>
                  {lastTxIdSendDoginal && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://sochain.com/tx/DOGE/${lastTxIdSendDoginal}`}
                      >
                        {lastTxIdSendDoginal}
                      </a>
                    </p>
                  )}
                  {txErrorSendDoginal && (
                    <ErrorMessage>{txErrorSendDoginal}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Send Dune',
              description: (
                <>
                  <form onSubmit={handleSendDune}>
                    <p>
                      <input
                        type="string"
                        name="toAddress"
                        placeholder="Destination Address"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="amount"
                        placeholder="Exact amount of the dune to send"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="dune"
                        placeholder="name of dune being transferred"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingSendDune} type="submit">
                      Send Dune Inscription
                    </button>
                  </form>
                  {lastTxIdSendDune && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://ord.dunesprotocol.com/tx/${lastTxIdSendDune}`}
                      >
                        {lastTxIdSendDune}
                      </a>
                    </p>
                  )}
                  {txErrorSendDune && (
                    <ErrorMessage>{txErrorSendDune}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Mint Dune',
              description: (
                <>
                  <form onSubmit={handleMintDune}>
                    <p>
                      <input
                        type="string"
                        name="id"
                        placeholder="Dune id to mint"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount of Dune to mint"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="receiver"
                        placeholder="Doge address to receive minted Dune"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingMintDune} type="submit">
                      Send Mint Dune Inscription
                    </button>
                  </form>
                  {lastTxIdMintDune && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://ord.dunesprotocol.com/tx/${lastTxIdMintDune}`}
                      >
                        {lastTxIdMintDune}
                      </a>
                    </p>
                  )}
                  {txErrorMintDune && (
                    <ErrorMessage>{txErrorMintDune}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Open Dune',
              description: (
                <>
                  <form onSubmit={handleOpenDune}>
                    <p>
                      <input
                        type="string"
                        name="tick"
                        placeholder="ticker"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="symbol"
                        placeholder="symbol of the dune"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="limit"
                        placeholder="mint limit"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="divisibility"
                        placeholder="How many decimals the dune can be divided into"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="cap"
                        placeholder="(optional) supply cap of the dune"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="heightStart"
                        placeholder="Block height to start minting"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="heightEnd"
                        placeholder="Block height to end minting"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="offsetStart"
                        placeholder="offset start"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="offsetEnd"
                        placeholder="offset end"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="premine"
                        placeholder="premine amount"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="boolean"
                        name="turbo"
                        placeholder="turbo mode"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="boolean"
                        name="openMint"
                        placeholder="If true, is indefinitely open for minting until cap is reached"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingOpenDune} type="submit">
                      Deploy Open Dune Inscription
                    </button>
                  </form>
                  {lastTxIdOpenDune && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://ord.dunesprotocol.com/tx/${lastTxIdOpenDune}`}
                      >
                        {lastTxIdOpenDune}
                      </a>
                    </p>
                  )}
                  {txErrorOpenDune && (
                    <ErrorMessage>{txErrorOpenDune}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Send Dune',
              description: (
                <>
                  <form onSubmit={handleSendDune}>
                    <p>
                      <input
                        type="string"
                        name="toAddress"
                        placeholder="Destination Address"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Exact amount of the dune to send"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="dune"
                        placeholder="name of dune being transferred"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingSendDune} type="submit">
                      Send Dune Inscription
                    </button>
                  </form>
                  {lastTxIdSendDune && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://ord.dunesprotocol.com/tx/${lastTxIdSendDune}`}
                      >
                        {lastTxIdSendDune}
                      </a>
                    </p>
                  )}
                  {txErrorSendDune && (
                    <ErrorMessage>{txErrorSendDune}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
        {isSnapInstalled && (
          <Card
            fullWidth
            content={{
              title: 'Send Transfer Inscription',
              description: (
                <>
                  <form onSubmit={handleSendDRC20}>
                    <p>
                      <input
                        type="text"
                        name="ticker"
                        placeholder="DRC-20 Token Ticker"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount in Token"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="toAddress"
                        placeholder="Destination Address"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <p>
                      <input
                        type="string"
                        name="utxo"
                        placeholder="Transfer Inscription UTXO"
                        onChange={(e) => e.target.value}
                      />
                    </p>
                    <button disabled={isTxLoadingSendDRC20} type="submit">
                      Send Transfer Inscription
                    </button>
                  </form>
                  {lastTxIdSendDRC20 && (
                    <p>
                      Latest transaction:{' '}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://sochain.com/tx/DOGE/${lastTxIdSendDRC20}`}
                      >
                        {lastTxIdSendDRC20}
                      </a>
                    </p>
                  )}
                  {txErrorSendDRC20 && (
                    <ErrorMessage>{txErrorSendDRC20}</ErrorMessage>
                  )}
                </>
              ),
            }}
          />
        )}
      </CardContainer>
    </Container>
  );
};

export default Index;
