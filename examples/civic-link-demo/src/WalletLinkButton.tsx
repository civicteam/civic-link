import { useWalletLinking, FlowType } from "@civic/civic-link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export const WalletLinkButton = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { successfullyAddedWalletToDidPromise, openLinkWalletPage } =
    useWalletLinking();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (successfullyAddedWalletToDidPromise) {
      successfullyAddedWalletToDidPromise.then((did) => {
        console.log("Successfully added wallet to DID: ", did);
      });
    }
  }, [successfullyAddedWalletToDidPromise]);

  const handleLinkWallet = async () => {
    openLinkWalletPage(FlowType.VERIFY_WITH_OWNERSHIP, publicKey?.toBase58());
  };

  return (
    <div>
      {publicKey ? (
        <button onClick={handleLinkWallet}>Link Wallet</button>
      ) : (
        <p> please connect wallet to start linking</p>
      )}
    </div>
  );
};
