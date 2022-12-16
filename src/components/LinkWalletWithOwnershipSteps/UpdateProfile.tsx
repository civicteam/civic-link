import { StepWrapper, RoundedButton } from "@civic/react-commons";
import type { StepProps } from "@civic/react-commons";
import { Transaction } from "@solana/web3.js";
import { PropsWithChildren, useCallback, useState } from "react";
import { LinkWalletService } from "../../lib/linkWalletService";
import { useMultiWallet } from "../providers";

type OwnProps = StepProps & {
  linkWalletServiceInst: LinkWalletService;
  linkWalletSignedTransaction: Transaction;
  onStepFailed: (error: Error) => unknown;
};

export default function UpdateProfile({
  linkWalletServiceInst,
  linkWalletSignedTransaction,
  status,
  setStepComplete,
  onStepFailed,
}: PropsWithChildren<OwnProps>): React.ReactElement {
  const { wallet: multiWallet } = useMultiWallet();
  const [signDisabled, setSignedDisabled] = useState<boolean>(false);

  const signAndSendTransaction = useCallback(async () => {
    try {
      if (!setStepComplete) {
        throw new Error("Need a step complete function defined");
      }
      if (!multiWallet.publicKey) {
        throw new Error("Wallet must have public key");
      }

      await linkWalletServiceInst.signAndSendUpdateDidTransaction(
        linkWalletSignedTransaction,
        multiWallet.signTransaction
      );
      setStepComplete();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("UpdateProfile error", error);
      setSignedDisabled(false);
      onStepFailed(error as Error);
    }
  }, [
    linkWalletServiceInst,
    linkWalletSignedTransaction,
    multiWallet.publicKey,
    multiWallet.signTransaction,
    onStepFailed,
    setStepComplete,
  ]);

  const onSignAndSendTransaction = useCallback(() => {
    setSignedDisabled(true);
    signAndSendTransaction();
  }, [signAndSendTransaction]);

  return (
    <StepWrapper status={status} setStepComplete={setStepComplete}>
      <div className="mt-4">
        <RoundedButton
          type="button"
          onClick={onSignAndSendTransaction}
          variant="medium"
          loading={signDisabled}
        >
          Update Profile
        </RoundedButton>
      </div>
    </StepWrapper>
  );
}
