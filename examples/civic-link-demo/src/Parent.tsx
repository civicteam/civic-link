import {
  useMultiWallet,
  WalletLinkingProvider,
  PostMessageProvider,
} from "@civic/civic-link";
import "@civic/react-commons/dist/style.css";
import { WalletLinkButton } from "./WalletLinkButton";

import "@solana/wallet-adapter-react-ui/styles.css";

export const Parent = () => {
  const { wallet, selectChain } = useMultiWallet();

  return (
    <PostMessageProvider
      targetWindow={window}
      targetWindowOrigin={window.origin}
      civicLinkUrl={`${window.location.href}linking`}
      listenForAnalytics={false}
    >
      <WalletLinkingProvider
        existingWalletAddresses={[]}
        civicLinkUrl={`${window.location.href}linking`}
        postMessageOrigin={"*"}
      >
        <div
          style={{
            height: "100%",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <p>Hi {wallet?.publicKey}!</p>
          <button onClick={() => selectChain()}>Select solana</button>
          <WalletLinkButton />
        </div>
      </WalletLinkingProvider>
    </PostMessageProvider>
  );
};
