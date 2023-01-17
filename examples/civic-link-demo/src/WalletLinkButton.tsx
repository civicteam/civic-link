import {
  useWalletLinking,
  FlowType,
  PostMessageProvider,
  useMultiWallet,
} from "@civic/civic-link";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export const WalletLinkButton = () => {
  const { wallet } = useMultiWallet();
  const { successfullyAddedWalletToDidPromise, openLinkWalletPage } =
    useWalletLinking();
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();

  useEffect(() => {
    if (successfullyAddedWalletToDidPromise) {
      successfullyAddedWalletToDidPromise.then((did) => {
        console.log("Successfully added wallet to DID: ", did);
      });
    }
  }, [successfullyAddedWalletToDidPromise]);

  const handleLinkWallet = () => {
    if (wallet.publicKey) {
      openLinkWalletPage(
        FlowType.VERIFY_WITH_OWNERSHIP,
        wallet.publicKey,
        connection.rpcEndpoint
      );
    }
  };

  return (
    <div>
      {wallet.publicKey ? (
        <button onClick={handleLinkWallet}>Link Wallet</button>
      ) : (
        <p> please connect wallet to start linking</p>
      )}
    </div>
  );
};
