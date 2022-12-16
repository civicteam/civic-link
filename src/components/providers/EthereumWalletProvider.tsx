import React, { createContext, useContext, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { getWeb3Modal } from "./builders/web3modal";
import { build } from "./builders/ethereum";
import { WalletAdapterInterface } from "../../types";

export const EthereumWalletContext = createContext<
  WalletAdapterInterface<string>
>({} as WalletAdapterInterface<string>);

export function useEthereumWallet(): WalletAdapterInterface<string> {
  return useContext(EthereumWalletContext);
}

export function EthereumWalletProvider({
  children,
}: {
  children: React.ReactChild;
}): React.ReactElement {
  const [account, setAccount] = useState<string>();
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>(getWeb3Modal());
  const [adapter, setAdapter] = useState<WalletAdapterInterface<string>>(
    {} as WalletAdapterInterface<string>
  );

  useEffect(() => {
    if (!web3Modal) {
      setWeb3Modal(getWeb3Modal());
    }
  }, [web3Modal]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setAdapter(await build(account ?? "", setAccount));
    })();
    return () => controller?.abort();
  }, [account]);

  useEffect(() => {
    const controller = new AbortController();
    if (
      web3Modal &&
      web3Modal.cachedProvider &&
      adapter.connect &&
      // We have to assume this is detached from civic.me hence not using appState
      localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")
    ) {
      (async () => {
        adapter.connect();
      })();
    }
    return () => controller?.abort();
  }, [adapter, web3Modal, web3Modal.cachedProvider]);

  return (
    <EthereumWalletContext.Provider value={adapter}>
      {children}
    </EthereumWalletContext.Provider>
  );
}
