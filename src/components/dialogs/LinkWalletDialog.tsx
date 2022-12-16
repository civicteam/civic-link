import React, { useCallback } from "react";
import {
  RoundedButton,
  WalletAddressStyles,
  getShortenedPublicKey,
  BaseDialog,
} from "@civic/react-commons";

function LinkWalletDialog({
  isOpen,
  onClose,
  onLinkThisWallet,
  loginWalletAddress,
  selectedWalletPublicKey,
  walletToLinkPublicKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLinkThisWallet: () => void;
  loginWalletAddress: string;
  selectedWalletPublicKey: string;
  walletToLinkPublicKey?: string;
}): React.ReactElement {
  const linkDisabled = useCallback(() => {
    if (walletToLinkPublicKey) {
      return selectedWalletPublicKey !== walletToLinkPublicKey;
    }
    return selectedWalletPublicKey === loginWalletAddress;
  }, [selectedWalletPublicKey, loginWalletAddress, walletToLinkPublicKey]);
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} contentClassName="max-w-lg">
      <WalletAddressStyles>
        <div className="flex flex-col justify-start gap-y-2">
          <h3 className="self-center">Link wallet</h3>
          <div className="mt-4 text-lg font-normal">
            Your currently selected wallet is:{" "}
            <div className="flex flex-col justify-start gap-y-2">
              <span className="dialog-wallet-address wallet-address-primary self-center">
                {getShortenedPublicKey(selectedWalletPublicKey)}
              </span>
            </div>
          </div>
          {walletToLinkPublicKey &&
            selectedWalletPublicKey !== walletToLinkPublicKey && (
              <div className="my-4 text-lg font-normal">
                Please select the wallet with address:
                <div className="flex flex-col justify-start gap-y-2">
                  <span className="dialog-wallet-address wallet-address-secondary self-center">
                    {getShortenedPublicKey(walletToLinkPublicKey)}
                  </span>
                </div>
              </div>
            )}

          {!walletToLinkPublicKey &&
            selectedWalletPublicKey === loginWalletAddress && (
              <p>
                This is the same wallet you logged in with. Please connect a
                different wallet (you can leave this dialog open).
              </p>
            )}
          {!walletToLinkPublicKey && (
            <p>Is this the wallet you would like to link?</p>
          )}

          <div className="self-center text-lg">
            <RoundedButton
              onClick={onLinkThisWallet}
              type="button"
              disabled={linkDisabled()}
            >
              Link this wallet
            </RoundedButton>
          </div>
        </div>
      </WalletAddressStyles>
    </BaseDialog>
  );
}
LinkWalletDialog.defaultProps = { walletToLinkPublicKey: undefined };
export default LinkWalletDialog;
