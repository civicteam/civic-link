import { WalletContextState } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ChainType, WalletAdapterInterface } from "../../../types";
import { clearSolanaWalletAdapterLocalStorage } from "../adapterUtils";

export async function build(
  lowLevelWallet: WalletContextState,
  connect: () => void,
  didResolver?: (arg: string) => Promise<string>
): Promise<WalletAdapterInterface<PublicKey>> {
  const { publicKey } = lowLevelWallet;
  let did;
  if (publicKey) {
    did = didResolver ? await didResolver(publicKey.toBase58()) : undefined;
  }
  return {
    ...(lowLevelWallet as unknown as WalletAdapterInterface<PublicKey>),

    name: lowLevelWallet?.wallet?.adapter?.name,
    connect: async () => {
      connect();
    },

    walletType: ChainType.SOLANA,

    publicKey: publicKey?.toBase58(),

    nativePublicKey: publicKey,

    did,

    disconnect(): Promise<void> {
      clearSolanaWalletAdapterLocalStorage();
      return lowLevelWallet.disconnect();
    },

    signTransaction: async (transaction: Transaction) => {
      const signedTransaction =
        lowLevelWallet &&
        lowLevelWallet.signTransaction &&
        lowLevelWallet.signTransaction(transaction);
      if (!signedTransaction) {
        throw new Error("Solana Sign transaction error");
      }
      return signedTransaction;
    },

    signAllTransactions: async (transactions: Transaction[]) => {
      const signedTransaction =
        lowLevelWallet &&
        lowLevelWallet.signAllTransactions &&
        lowLevelWallet.signAllTransactions(transactions);
      if (!signedTransaction) {
        throw new Error("Solana Sign transactions error");
      }
      return signedTransaction;
    },
  };
}
