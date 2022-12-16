import { PublicKey } from "@solana/web3.js";
import { WalletAdapterInterface } from "../../types";

export const allowWalletChange = (
  currentWallet: WalletAdapterInterface<string | PublicKey>,
  selected: WalletAdapterInterface<string | PublicKey>
): boolean => {
  if (
    !currentWallet.publicKey || // no existing wallet
    selected.disconnecting || // selected wallet is in the process of disconnecting
    !selected.publicKey // selected wallet has disconnected
  ) {
    return true;
  }
  return false;
};

export const clearSolanaWalletAdapterLocalStorage = (): void => {
  localStorage.removeItem("wallet_type");
  // clears the solana wallet adapter setting to allow selecting a different wallet
  localStorage.removeItem("walletName");
};
