# Civic Link

This package orchestrates a user picking two different wallets on a single dApp, for example to link them together in some way.
This works by setting up communication between the dApp and a child pop-up browser tab, which has a separate wallet signing context.
The second wallet's information is then passed back to the parent dApp through an API based on window.postMessage.

## Usage

To use Civic Link, create a component using `LinkWalletWithOwnershipFlow` from `@civic/civic-link` wrapped with `WalletConnectionProvider` and `PostMessageProvider` (to listen to the link wallet events):
```typescript
import React from "react";
import {
  LinkWalletInputParameters,
  WalletConnectionProvider,
  LinkWalletWithOwnershipFlow,
  PostMessageProvider,
} from "@civic/civic-link";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export function LinkWalletExampleComponent({
  linkWalletInputParameters,
  targetWindow,
}: {
  linkWalletInputParameters: LinkWalletInputParameters;
  targetWindow: Window;
}): React.ReactElement {
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
}
```

This can be defined as part of a **dApp's child pop-up browser tab**.

The `useMultiWallet` hook provides an interface to the selected wallet:
```typescript
import { useMultiWallet } from "@civic/civic-link";

function TestComponent({
  const { wallet } = useMultiWallet();

  useEffect(() => {
    // ...
  }, [wallet.publicKey]);
});
```

### Listening to events

The `useCivicPostMessageApi` hook provides an interface to listen to the link wallet events **in the parent dApp**:
```typescript
import { useCivicPostMessageApi } from "@civic/civic-link";

function TestComponent({
  const { postMessageApi } = useCivicPostMessageApi();

  // define a callback for when the child window sends a message:
  const postMessageCallback = useCallback(
    ({ eventType, data }: IncomingEvent) => {
      console.log("postMessageApi IncomingEvent", {
        eventType,
        data,
      });
    // your event handling logic here
    },
  );

  // attach the callback to the window.postMessage listener:
  useEffect(() => {
    postMessageApi.addEventListener(postMessageCallback);
    return () => postMessageApi.removeEventListeners();
  }, [postMessageApi]);
});
```
The `IncomingEvent` is interpreted as follows:
  1. `incomingEvent.event` is one of:
    - `IncomingEvent.WALLET_CONNECTED` => User has connected a wallet in the child window
    // TODO: Document these when implemented:
    - `IncomingEvent.ADD_WALLET_TO_DID_WITH_VERIFICATION`
  2. `incomingEvent.data?.publicKey` : Base58-encoded Solana address of the wallet connected in the child window