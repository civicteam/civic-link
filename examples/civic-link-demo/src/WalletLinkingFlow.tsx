import React, { useMemo, useState, useEffect } from "react";
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

export const WalletLinkingFlow = ({}: {}) => {
  const queryParams = queryString.parse(window.location.search);

  const linkWalletInputParameters = useMemo(
    () => queryParams || {},
    [queryParams]
  ) as LinkWalletInputParameters;

  return (
    <PostMessageProvider
      targetWindow={window.opener}
      targetWindowOrigin={linkWalletInputParameters.origin || "*"}
      listenForAnalytics={false}
    >
      <WalletConnectionProvider>
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={window.opener}
          horizontalSteps={false}
        />
      </WalletConnectionProvider>
    </PostMessageProvider>
  );
};
