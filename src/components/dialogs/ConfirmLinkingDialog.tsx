import React from "react";

import {
  RoundedButton,
  WalletAddressStyles,
  getShortenedPublicKey,
  BaseDialog,
} from "@civic/react-commons";

function ConfirmLinkingDialog({
  isOpen,
  onClose,
  loginWalletAddress,
  stagedWallets,
  selectedWalletPublicKey,
  onOk,
}: {
  isOpen: boolean;
  onClose: () => void;
  loginWalletAddress: string;
  stagedWallets: string[];
  selectedWalletPublicKey: string;
  onOk: () => void;
}): React.ReactElement {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} contentClassName="max-w-lg">
      <WalletAddressStyles>
        <div className="flex flex-col justify-start gap-y-2">
          <h3 className="self-center">Wallet linking</h3>
          <ul className="mt-4 text-lg font-normal">
            You chose these wallet(s) to be linked:{" "}
            {stagedWallets.map((stagedWallet) => {
              return (
                <li
                  className="my-2 flex flex-col justify-start gap-y-4"
                  key={stagedWallet}
                >
                  <span className="dialog-wallet-address wallet-address-primary self-center">
                    {getShortenedPublicKey(stagedWallet)}
                  </span>
                </li>
              );
            })}
          </ul>
          {selectedWalletPublicKey !== loginWalletAddress && (
            <div className="mt-2 text-lg font-normal">
              Please change your selected wallet back to the wallet you used to
              log in with (you can leave this dialog open):{" "}
              <div className="my-2 flex flex-col justify-start gap-y-2">
                <span className="dialog-wallet-address wallet-address-mismatch self-center">
                  {getShortenedPublicKey(loginWalletAddress)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-2 self-center text-lg">
            <RoundedButton onClick={onClose} type="button" disabled={false}>
              Cancel
            </RoundedButton>
            <RoundedButton
              onClick={onOk}
              type="button"
              disabled={selectedWalletPublicKey !== loginWalletAddress}
            >
              Save
            </RoundedButton>
          </div>
        </div>
      </WalletAddressStyles>
    </BaseDialog>
  );
}

export default ConfirmLinkingDialog;
