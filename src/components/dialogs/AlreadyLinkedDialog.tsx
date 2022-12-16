import React from "react";

import {
  getShortenedPublicKey,
  WalletAddressStyles,
  BaseDialog,
  StyledRoundedCenteredButton,
} from "@civic/react-commons";

export default function AlreadyLinkedDialog({
  isOpen,
  walletAddress,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}): React.ReactElement {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} contentClassName="max-w-md">
      <WalletAddressStyles>
        <div className="pb-5 text-center text-xl">
          Wallet{" "}
          <span className="dialog-wallet-address wallet-address-primary">
            {getShortenedPublicKey(walletAddress)}
          </span>
          has already been linked.
        </div>
        <StyledRoundedCenteredButton
          type="button"
          onClick={onClose}
          className="mt-4 !px-16"
          disabled={false}
        >
          Ok
        </StyledRoundedCenteredButton>
      </WalletAddressStyles>
    </BaseDialog>
  );
}
