import React from "react";
import { SpinnerInfoDialog } from "@civic/react-commons";

function WalletLinkingInProgress({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}): React.ReactElement {
  return (
    <SpinnerInfoDialog
      isOpen={isOpen}
      title="Link wallet"
      description="Continue in new browser window"
      closeButtonLabel="Cancel"
      onClose={onClose}
    />
  );
}

export default WalletLinkingInProgress;
