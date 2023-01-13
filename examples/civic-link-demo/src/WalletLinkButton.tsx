import { WalletLinkingProvider } from "@civic/civic-link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const WalletLinkButton = () => {
  const { publicKey, sendTransaction } = useWallet();

  return (
    <div>
      {publicKey ? (
        // <WalletLinkingProvider
        //   existingWalletAddresses={[
        //     "2dm3CqveDgGgsHmNXNWBAUDfVUeDsbY2Cxr3kdH4GWFQ",
        //   ]}
        //   civicLinkUrl={"/linking"}
        //   postMessageOrigin={"/"}
        // >
        <button> Link Wallet</button>
      ) : (
        // </WalletLinkingProvider>
        <p> Connect Wallet</p>
      )}
    </div>
  );
};
