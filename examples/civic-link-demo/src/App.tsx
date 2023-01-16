import React, { useMemo, useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.svg";
import {
  ConnectionProvider,
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
import { LinkWalletInputParameters } from "@civic/civic-link";
import "@civic/react-commons/dist/style.css";
import { WalletLinkingFlow } from "./WalletLinkingFlow";

import "@solana/wallet-adapter-react-ui/styles.css";

import { Parent } from "./Parent";

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

  return (
    <div className="App">
      <div className="App-header">
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Routes>
                <Route index element={<Parent />} />
                <Route path="/linking" element={<WalletLinkingFlow />} />
              </Routes>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </div>
  );
}

export default App;
