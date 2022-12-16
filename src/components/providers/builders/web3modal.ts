import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";
import Web3Modal, { IProviderOptions } from "web3modal";
import { Web3Provider } from "@ethersproject/providers";

export function getWeb3Modal(): Web3Modal {
  const providerOptions: IProviderOptions = {
    metamask: {
      id: "injected",
      name: "MetaMask",
      type: "injected",
      check: "isMetaMask",
    },
    walletlink: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "CoinbaseWallet",
      },
    },
  } as unknown as IProviderOptions;

  return new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    disableInjectedProvider: false,
    providerOptions,
    theme: {
      background: "rgb(255,255, 255)",
      main: "rgb(47, 13, 48)",
      secondary: "rgb(47, 13, 48, 0.80)",
      border: "rgb(47, 13, 48, 0.10)",
      hover: "rgba(220, 221, 225,1.0)",
    },
  });
}

/**
 * Retrieves List of accounts associated with connected wallet.
 * @param web3Modal
 */
export async function retrieveWeb3Accounts(
  web3Modal: Web3Modal
): Promise<string[]> {
  const provider = await web3Modal.connect();
  const lib = new Web3Provider(provider);
  return lib?.listAccounts();
}

export default getWeb3Modal;
