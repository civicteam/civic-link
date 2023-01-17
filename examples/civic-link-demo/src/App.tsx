import React, { useMemo } from "react";
import "./App.css";
import {
  ConnectionProvider,
  useConnection,
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

import "@civic/react-commons/dist/style.css";

import { MyRoutes } from "./Routes";

import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <div className="App">
      <div className="App-header">
        <ConnectionProvider endpoint={endpoint}>
          <MyRoutes />
        </ConnectionProvider>
      </div>
    </div>
  );
}

export default App;
