import React from "react";
import {
  LinkWalletInputParameters,
  WalletConnectionProvider,
  LinkWalletWithOwnershipFlow,
  PostMessageProvider,
  FlowType,
  WalletChainType,
} from "@civic/civic-link";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import queryString from "query-string";

// const linkingParams: LinkWalletInputParameters = {
//   existingAuthorityPublicKey: "",
//   existingAuthorityDid: "",
//   flow: FlowType.VERIFY_WITH_OWNERSHIP,
//   origin: "",
//   chainNetwork: WalletChainType.SOLANA,
// };

// const targetWindow = window;

export const WalletLinkingFlow = ({
  linkWalletInputParameters,
  targetWindow,
}: {
  linkWalletInputParameters: LinkWalletInputParameters;
  targetWindow: Window;
}) => {
  return (
    <PostMessageProvider
      targetWindow={targetWindow}
      targetWindowOrigin={linkWalletInputParameters.origin || "*"}
      listenForAnalytics={false}
    >
      <WalletConnectionProvider
        setWalletOnProviderChange
        network={linkWalletInputParameters.chainNetwork as WalletAdapterNetwork}
      >
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
          horizontalSteps={false}
        />
      </WalletConnectionProvider>
    </PostMessageProvider>
  );
};
