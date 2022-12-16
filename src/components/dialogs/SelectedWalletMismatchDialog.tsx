import React from "react";
import { PublicKey } from "@solana/web3.js";
import {
  BaseDialog,
  getShortenedPublicKey,
  StyledRoundedCenteredButton,
} from "@civic/react-commons";
import { WalletAdapterInterface } from "../../types";

export default function SelectedWalletMismatchDialog({
  isOpen,
  onClose,
  loggedInWallet,
  selectedWalletPublicKey,
  mismatchWalletPublicKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  loggedInWallet: WalletAdapterInterface<string | PublicKey>;
  selectedWalletPublicKey: string;
  mismatchWalletPublicKey: string;
}): React.ReactElement {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} contentClassName="max-w-md">
      <>
        <h4 className="mx-auto text-center text-xl font-semibold leading-relaxed text-primary">
          Wallet mismatch
        </h4>
        <div className="w-full items-center justify-center pb-0 pt-4 text-center">
          <p>
            Your currently selected wallet{" "}
            <span>
              {getShortenedPublicKey(mismatchWalletPublicKey as string)}
            </span>{" "}
            doesn&apos;t match the wallet you used to login.
          </p>
          <br />
          <p>
            Select{" "}
            <span className="font-semibold">
              {getShortenedPublicKey(loggedInWallet.publicKey as string)}
            </span>{" "}
            from your wallet provider to continue.
          </p>{" "}
          <br />
        </div>
        <div className="ml-0 w-full flex-auto items-center text-gray-500">
          <StyledRoundedCenteredButton
            type="button"
            onClick={onClose}
            className="mt-4 !px-16"
            disabled={selectedWalletPublicKey !== loggedInWallet.publicKey}
          >
            Ok
          </StyledRoundedCenteredButton>
        </div>
      </>
    </BaseDialog>
  );
}
