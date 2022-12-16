import { StepWrapper, RoundedButton } from "@civic/react-commons";
import type { StepProps } from "@civic/react-commons";
import { PropsWithChildren, useCallback, useState } from "react";
import { LinkWalletService } from "../../lib/linkWalletService";
import { useMultiWallet } from "../providers";

type OwnProps = StepProps & {
  linkWalletServiceInst: LinkWalletService;
  walletToLinkPublicKey: string;
  onStepFailed: (error: Error) => unknown;
};

export default function ProveWalletOwnership({
  linkWalletServiceInst,
  walletToLinkPublicKey,
  status,
  setStepComplete,
  onStepFailed,
}: PropsWithChildren<OwnProps>): React.ReactElement {
  const { wallet: multiWallet } = useMultiWallet();
  const [signDisabled, setSignedDisabled] = useState<boolean>(false);

  const onSignTransaction = useCallback(() => {
    setSignedDisabled(true);
    const abortController = new AbortController();
    const doSignTransaction = async () => {
      try {
        if (!multiWallet.publicKey) {
          throw new Error("Wallet must have public key");
        }
        const useSignedTransaction =
          await linkWalletServiceInst.proveOwnershipOfLinkedWallet(
            walletToLinkPublicKey,
            multiWallet.signTransaction
          );
        if (abortController.signal.aborted) {
          return;
        }
        setStepComplete(useSignedTransaction);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("doSignTransaction error", error);
        if (abortController.signal.aborted) {
          return;
        }
        setSignedDisabled(false);
        onStepFailed(error as Error);
      }
    };
    doSignTransaction();
    return () => abortController.abort();
  }, [
    linkWalletServiceInst,
    multiWallet.publicKey,
    multiWallet.signTransaction,
    onStepFailed,
    setStepComplete,
    walletToLinkPublicKey,
  ]);

  return (
    <StepWrapper status={status} setStepComplete={setStepComplete}>
      <div className="mt-4 text-lg font-normal">
        <RoundedButton
          type="button"
          onClick={onSignTransaction}
          variant="medium"
          loading={signDisabled}
        >
          Sign Transaction
        </RoundedButton>
      </div>
    </StepWrapper>
  );
}
