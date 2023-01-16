import { Routes, Route } from "react-router-dom";
import { WalletConnectionProvider } from "@civic/civic-link";
import "@civic/react-commons/dist/style.css";
import { WalletLinkingFlow } from "./WalletLinkingFlow";

import "@solana/wallet-adapter-react-ui/styles.css";

import { Parent } from "./Parent";

export const MyRoutes = () => {
  const resolver = (query: string) => Promise.resolve(`did:sol:${""}${query}`);

  return (
    <WalletConnectionProvider didResolver={resolver}>
      <Routes>
        <Route index element={<Parent />} />
        <Route path="/linking/*" element={<WalletLinkingFlow />} />
      </Routes>
    </WalletConnectionProvider>
  );
};
