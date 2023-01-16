import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  useMultiWallet,
  WalletLinkingProvider,
  PostMessageProvider,
} from "@civic/civic-link";
import "@civic/react-commons/dist/style.css";
import { WalletLinkButton } from "./WalletLinkButton";

import "@solana/wallet-adapter-react-ui/styles.css";

export const Parent = () => {
  const { wallet } = useMultiWallet();

  return (
    <PostMessageProvider
      targetWindow={window}
      targetWindowOrigin={window.origin}
      civicLinkUrl={"http://localhost:3000/linking"}
      listenForAnalytics={false}
    >
      <div
        style={{
          height: "100%",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <p>Hi {wallet?.publicKey}!</p>
        <WalletMultiButton />
        <WalletLinkingProvider
          existingWalletAddresses={[]}
          civicLinkUrl={"http://localhost:3000/linking"}
          postMessageOrigin={"*"}
        >
          <WalletLinkButton />
        </WalletLinkingProvider>
      </div>
    </PostMessageProvider>
  );
};
