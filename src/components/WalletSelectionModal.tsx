import React, { PropsWithChildren } from "react";
import { PublicKey } from "@solana/web3.js";
import SolanaIcon from "../assets/img/icons/solana.svg";
import EthereumIcon from "../assets/img/icons/ethereum.svg";
import { WalletAdapterInterface, WalletChainType } from "../types";
import { useSolanaWallet } from "./providers/SolanaWalletProvider";
import { useEthereumWallet } from "./providers/EthereumWalletProvider";
import { clearSolanaWalletAdapterLocalStorage } from "./providers/adapterUtils";

type OwnProps = {
  modalDismiss: () => void;
  setWallet: (provider: WalletAdapterInterface<string | PublicKey>) => void; // contains pointer to parent component's setWallet function
  chains?: WalletChainType[];
};
/**
 * @name WalletSelectionModal
 * @description A modal that allows the user to select a chain and wallet to use.
 * @param {() => void} modalDismiss - Callback to close modal from parent component.
 * @param {(provider: WalletAdapterInterface<string | PublicKey>) => void} setWallet - Sets wallet.
 */
function WalletSelectionModal({
  modalDismiss,
  setWallet,
  chains = [WalletChainType.SOLANA],
}: PropsWithChildren<OwnProps>): React.ReactElement {
  const solanaWallet = useSolanaWallet();
  const ethereumWallet = useEthereumWallet();
  const connectWallet = (
    provider: WalletAdapterInterface<string | PublicKey>
  ) => {
    // the wallet adapter connection could fail, so to make sure that
    // a different wallet can be retried, clear the solana wallet adapter storage
    provider
      .connect()
      .then(() => {
        setWallet(provider);
        modalDismiss();
      })
      .catch((error: Error) => {
        clearSolanaWalletAdapterLocalStorage();
        // eslint-disable-next-line no-console
        console.error("Solana connection error", error);
        throw error;
      });
  };

  return (
    <div
      aria-labelledby="wallet-adapter-modal-title"
      aria-modal="true"
      className="wallet-adapter-modal wallet-adapter-modal-fade-in "
      role="dialog"
    >
      <div className="wallet-adapter-modal-container">
        <div className="wallet-adapter-modal-wrapper wallet-adapter-modal-wrapper-no-logo civic-card-background">
          <h3
            className="wallet-adapter-modal-title -mb-4 text-white"
            id="wallet-adapter-modal-title"
          >
            Choose Network
          </h3>
          <button
            type="button"
            onClick={modalDismiss}
            className="wallet-adapter-modal-button-close"
          >
            <svg width="14" height="14">
              <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
            </svg>
          </button>
          <ul className="wallet-adapter-modal-list">
            {chains.includes(WalletChainType.SOLANA) && (
              <li>
                <button
                  className="wallet-adapter-button solana-adapter-trigger flex h-12 w-full cursor-pointer items-center justify-between rounded-md bg-primary px-5 text-base font-semibold text-white hover:bg-opacity-75"
                  onClick={() => {
                    connectWallet(solanaWallet);
                  }}
                  type="button"
                  data-testid="solana-adapter-trigger"
                >
                  Solana
                  <SolanaIcon />
                </button>
              </li>
            )}
            {chains.includes(WalletChainType.ETHEREUM) && (
              <li>
                <button
                  className="wallet-adapter-button eth-adapter-trigger flex h-12 w-full cursor-pointer items-center justify-between rounded-md bg-primary px-5 text-base font-semibold text-white hover:bg-opacity-75"
                  onClick={() => {
                    connectWallet(ethereumWallet);
                  }}
                  type="button"
                  data-testid="ethereum-adapter-trigger"
                >
                  Ethereum
                  <EthereumIcon />
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="wallet-adapter-modal-overlay" />
    </div>
  );
}
WalletSelectionModal.defaultProps = {
  chains: [WalletChainType.SOLANA],
};
export default WalletSelectionModal;
