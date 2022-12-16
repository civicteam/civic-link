# Civic Link

This package orchestrates a user picking two different wallets on a single dApp, for example to link them together in some way.
This works by setting up communication the dApp and a child pop-up browser tab, which has a separate wallet signing context.
The second wallet's information is then passed back to the parent dApp through an API based on window.postMessage.

## Usage

### In the parent dApp:
```typescript
import {
  CivicPostMessageApi,
  IncomingEvent,
  LinkEventType,
  windowEventListener,
} from "@civic/civic-link";

// Open your pop-up with its own wallet provider ( code not shown here ).
// Then set up the communication:

const postMessageApi = windowEventListener(window) as CivicPostMessageApi;

  // Define a callback for when the child window sends a message:
  const postMessageCallback = useCallback(
    ({ eventType, data }: IncomingEvent) => {
      console.log("postMessageApi IncomingEvent", {
        eventType,
        data,
      });
    // Your event handling logic here
    },
  );

  // Attach the callback to the window.postMessage listener:
  useEffect(() => {
    postMessageApi.addEventListener(postMessageCallback);
    return () => postMessageApi.removeEventListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

The `IncomingEvent` is interpreted as follows:
  1. `incomingEvent.event` is one of:
    - `IncomingEvent.WALLET_CONNECTED` => User has connected a wallet in the child window
    // TODO: Document these when implemented:
    - `IncomingEvent.ADD_WALLET_TO_DID_WITH_VERIFICATION`

  2. `incomingEvent.data?.publicKey` : Base58-encoded Solana address of the wallet connected in the child window

### In the child window:
```typescript
import {
  CivicPostMessageApi,
  LinkEventType,
  windowEventListener,
} from "@civic/civic-link";

// Attach an event listener to the parent window, or current window if there's no parent:
const postMessageApiInst = windowEventListener(window.opener || window);

// When the user connects a wallet ( called solanaWallet here ), send an event back to the parent window:
const connectionEvent = {
      eventType: LinkEventType.WALLET_CONNECTED,
      data: { publicKey: solanaWallet.publicKey },
};

// Close this child window:
if (window.opener) {
    window.opener.focus();
    window.close();
}
```