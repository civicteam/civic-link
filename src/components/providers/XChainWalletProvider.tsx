import { PublicKey } from "@solana/web3.js";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { allowWalletChange } from "./adapterUtils";
import {
  MultiWalletConnectionInterface,
  WalletAdapterInterface,
  ChainType,
} from "../../types";
import { useSolanaWallet } from "./SolanaWalletProvider";
import { useEthereumWallet } from "./EthereumWalletProvider";
import WalletSelectionModal from "../WalletSelectionModal";
import SelectedWalletMismatchDialog from "../dialogs/SelectedWalletMismatchDialog";

export const XChainWalletContext =
  createContext<MultiWalletConnectionInterface>(
    {} as MultiWalletConnectionInterface
  );

export function useMultiWallet(): MultiWalletConnectionInterface {
  return useContext(XChainWalletContext);
}

type OwnProps = {
  walletType?: ChainType;
  setWalletOnProviderChange?: boolean;
};
export function XChainWalletProvider({
  children,
  walletType = ChainType.SOLANA,
  setWalletOnProviderChange = false,
}: PropsWithChildren<OwnProps>): React.ReactElement {
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [mismatchWalletPublicKey, setMismatchWalletPublicKey] =
    useState<string>("");
  const [walletMismatchAcknowledged, setWalletMismatchAcknowledged] =
    useState(false);
  const [showWalletMismatchDialog, setShowWalletMismatchDialog] =
    useState<boolean>(false);
  const [wallet, setWallet] = useState<
    WalletAdapterInterface<string | PublicKey>
  >({} as WalletAdapterInterface<string | PublicKey>);

  const solanaWalletProvider = useSolanaWallet();
  const ethereumWalletProvider = useEthereumWallet();

  const selectChain = useCallback(
    () => setConnectingWallet(true),
    [setConnectingWallet]
  );

  const selected =
    walletType === ChainType.ETHEREUM
      ? ethereumWalletProvider
      : solanaWalletProvider;

  const selectedWalletMismatch = useCallback(() => {
    return selected.publicKey !== wallet.publicKey;
  }, [selected, wallet]);

  /**
   * Utility function that can be used to insert selected wallet validation into any flow
   */
  const validateSelectedWallet = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!selectedWalletMismatch()) {
        resolve(true);
      } else {
        setWalletMismatchAcknowledged(false);
        setShowWalletMismatchDialog(true);
      }
    });
  }, [
    selectedWalletMismatch,
    setWalletMismatchAcknowledged,
    setShowWalletMismatchDialog,
  ]);

  const value = useMemo(
    () => ({
      wallet,
      selectedProviderWallet: solanaWalletProvider,
      setWallet,
      selectChain,
      validateSelectedWallet,
    }),
    [
      validateSelectedWallet,
      wallet,
      selectChain,
      setWallet,
      solanaWalletProvider,
    ]
  );
  useEffect(() => {
    // a change to the 'selected' wallet is triggered by a change to the
    // wallet provider, i.e. changing wallets in Phantom. We don't want
    // to update the wallet in state unless the user explicitly logs out
    // then in again, so we only allow setting the wallet if the 'existing'
    // wallet publicKey is null or undefined
    if (setWalletOnProviderChange || allowWalletChange(wallet, selected)) {
      setWallet(selected);
    } else if (selectedWalletMismatch() && selected.publicKey) {
      setMismatchWalletPublicKey(selected.publicKey);
    }
  }, [
    setWallet,
    selected,
    wallet,
    setMismatchWalletPublicKey,
    selectedWalletMismatch,
    setWalletOnProviderChange,
  ]);

  const fetchWalletSetter = () => {
    return (passedWallet: WalletAdapterInterface<string | PublicKey>) => {
      setConnectingWallet(false);
      setWallet(passedWallet);
    };
  };

  return (
    <XChainWalletContext.Provider value={value}>
      {showWalletMismatchDialog && solanaWalletProvider.publicKey && (
        <SelectedWalletMismatchDialog
          selectedWalletPublicKey={solanaWalletProvider.publicKey}
          mismatchWalletPublicKey={mismatchWalletPublicKey}
          loggedInWallet={wallet}
          isOpen={!walletMismatchAcknowledged && showWalletMismatchDialog}
          onClose={() => {
            setWalletMismatchAcknowledged(true);
          }}
        />
      )}
      {connectingWallet && (
        <WalletSelectionModal
          setWallet={fetchWalletSetter()}
          modalDismiss={() => setConnectingWallet(false)}
        />
      )}
      {children}
    </XChainWalletContext.Provider>
  );
}

XChainWalletProvider.defaultProps = {
  walletType: ChainType.SOLANA,
  setWalletOnProviderChange: false,
};
