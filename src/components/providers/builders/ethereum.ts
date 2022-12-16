import { Web3Provider } from "@ethersproject/providers";
import { WalletAdapterInterface, ChainType } from "../../../types";
import { getWeb3Modal, retrieveWeb3Accounts } from "./web3modal";

export async function build(
  account: string,
  setConnectedAccount: (arg0: string) => void
): Promise<WalletAdapterInterface<string>> {
  const web3Modal = getWeb3Modal();

  return {
    walletType: ChainType.ETHEREUM,
    disconnecting: true,
    publicKey: account,
    connecting: true,
    connected: account !== "",
    nativePublicKey: account,

    ready(): Promise<boolean> {
      return Promise.resolve(true);
    },

    connect(): Promise<void> {
      (async () => {
        const accounts = await retrieveWeb3Accounts(web3Modal);
        if (accounts) {
          setConnectedAccount(accounts[0]);
        }
      })();
      return Promise.resolve();
    },

    disconnect(): Promise<void> {
      localStorage.removeItem("wallet_type");
      localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
      web3Modal.clearCachedProvider();
      setConnectedAccount("");
      return Promise.resolve();
    },

    library: web3Modal.cachedProvider
      ? new Web3Provider(await web3Modal.connect())
      : null,

    signMessage() {
      throw new Error("This method is not implemented");
    },
    sendTransaction() {
      throw new Error("This method is not implemented");
    },
    signTransaction() {
      throw new Error("This method is not implemented");
    },
    signAllTransactions() {
      throw new Error("This method is not implemented");
    },
    did: `did:ethr:${account}`,
  };
}
