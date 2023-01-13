import React, { useMemo, useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.svg";
import {
  ConnectionProvider,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import queryString from "query-string";
import { LinkWalletInputParameters } from "@civic/civic-link";
import "@civic/react-commons/dist/style.css";
import { WalletLinkButton } from "./WalletLinkButton";
import { WalletLinkingFlow } from "./WalletLinkingFlow";

import "@solana/wallet-adapter-react-ui/styles.css";

const Content = () => {
  const wallet = useWallet();
  return (
    <div
      style={{
        height: "100%",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <WalletMultiButton />
      <p>Hi {wallet?.publicKey?.toBase58()}!</p>
      <WalletLinkButton />
    </div>
  );
};

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new SolletWalletAdapter({ network }),
    ],
    [network]
  );
  const queryParams = queryString.parse(window.location.search);
  const [targetWindow, setTargetWindow] = useState<Window>(window);

  const linkWalletInputParameters = useMemo(
    () => queryParams || {},
    [queryParams]
  ) as LinkWalletInputParameters;

  useEffect(() => {
    setTargetWindow(window.opener || window);
  }, []);

  return (
    <div className="App">
      <div className="App-header">
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Routes>
                <Route index element={<Content />} />
                <Route
                  path="linking"
                  element={
                    <WalletLinkingFlow
                      linkWalletInputParameters={linkWalletInputParameters}
                      targetWindow={targetWindow}
                    />
                  }
                />
              </Routes>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </div>
  );
}

export default App;
