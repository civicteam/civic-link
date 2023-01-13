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
import { Routes, Route } from "react-router-dom";
import queryString from "query-string";
import {
  LinkWalletInputParameters,
  useMultiWallet,
  WalletConnectionProvider,
  WalletLinkingProvider,
  PostMessageProvider,
} from "@civic/civic-link";
import "@civic/react-commons/dist/style.css";
import { WalletLinkButton } from "./WalletLinkButton";
import { WalletLinkingFlow } from "./WalletLinkingFlow";

import "@solana/wallet-adapter-react-ui/styles.css";

const Content = () => {
  const wallet = useWallet();
  const multiWallet = useMultiWallet();

  console.log("useMultiWallet", multiWallet);
  console.log("wallet", wallet);
  return (
    <div
      style={{
        height: "100%",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <p>Hi {wallet?.publicKey?.toBase58()}!</p>
      <WalletMultiButton />
      {wallet && wallet.publicKey && (
        <WalletLinkingProvider
          existingWalletAddresses={[]}
          civicLinkUrl={"/linking"}
          postMessageOrigin={"/"}
        >
          <WalletLinkButton />
        </WalletLinkingProvider>
      )}
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
          <PostMessageProvider
            targetWindow={targetWindow}
            targetWindowOrigin={linkWalletInputParameters.origin || "*"}
            listenForAnalytics={false}
          >
            <WalletProvider wallets={wallets} autoConnect>
              <WalletConnectionProvider>
                <WalletModalProvider>
                  <Routes>
                    <Route index element={<Content />} />
                    <Route
                      path="/linking"
                      element={
                        <WalletLinkingFlow
                          linkWalletInputParameters={linkWalletInputParameters}
                          targetWindow={targetWindow}
                        />
                      }
                    />
                  </Routes>
                </WalletModalProvider>
              </WalletConnectionProvider>
            </WalletProvider>
          </PostMessageProvider>
        </ConnectionProvider>
      </div>
    </div>
  );
}

export default App;
