import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  HorizontalSteps,
  VerticalSteps,
  setStepComplete,
  BaseDialog,
  StyledRoundedCenteredButton,
  getShortenedPublicKey,
} from "@civic/react-commons";
import { CheckIcon } from "@heroicons/react/20/solid";
import type { Step } from "@civic/react-commons";
import { Connection, Transaction } from "@solana/web3.js";
import Confetti from "react-confetti";
import { validateLinkWalletInput } from "../lib/validation";
import { LinkWalletService } from "../lib/linkWalletService";
import { AnalyticsEventCategory, LinkWalletInputParameters } from "../types";
import ProveWalletOwnership from "./LinkWalletWithOwnershipSteps/ProveWalletOwnership";
import ConnectWalletStep from "./LinkWalletWithOwnershipSteps/ConnectWalletStep";
import UpdateProfile from "./LinkWalletWithOwnershipSteps/UpdateProfile";
import { useCivicPostMessageApi } from "./providers/PostMessageProvider";
import { useMultiWallet } from "./providers";
import { clearStorageAndCookies } from "../lib";

type LinkWalletWithOwnershipFlowProps = {
  linkWalletInputParameters: LinkWalletInputParameters;
  targetWindow: Window;
  horizontalSteps?: boolean;
};

function LinkWalletWithOwnershipFlow({
  linkWalletInputParameters,
  targetWindow,
  horizontalSteps = false,
}: PropsWithChildren<LinkWalletWithOwnershipFlowProps>): React.ReactElement {
  const { wallet: multiWallet } = useMultiWallet();
  const { postMessageApi } = useCivicPostMessageApi();
  const connection = useMemo(() => {
    return new Connection(
      linkWalletInputParameters.rpcEndpoint || "mainnet-beta"
    );
  }, [linkWalletInputParameters.rpcEndpoint]);

  const linkWalletServiceInst = useMemo(() => {
    return new LinkWalletService(
      postMessageApi,
      linkWalletInputParameters,
      AnalyticsEventCategory.MakePublicWithOwnership,
      connection
    );
  }, [connection, linkWalletInputParameters, postMessageApi]);

  const [steps, setSteps] = useState<Step[]>(
    linkWalletServiceInst.stepsMetaInfo
  );
  const [inputParametersValidation, setInputParametersValidation] = useState<
    "pending" | "success" | "invalid-input-parameters" | "already-linked"
  >();
  const [stepFailed, setStepFailed] = useState<number>();
  const [isFlowComplete, setIsFlowComplete] = useState<boolean>(false);
  const [linkWalletSignedTransaction, setLinkWalletSignedTransaction] =
    useState<Transaction>();
  const [walletToLinkPublicKey, setWalletToLinkPublicKey] = useState<string>();

  const updateStep = (stepIndex: number) => {
    linkWalletServiceInst.emitStepCompleteAnalytics(stepIndex);
    setSteps(setStepComplete(stepIndex, linkWalletServiceInst.stepsMetaInfo));
  };

  // initialisation of Link Wallet: initialise the linkWalletService and validate input parameters
  useEffect(() => {
    const abortController = new AbortController();
    setInputParametersValidation("pending");
    const inputParametersValid = validateLinkWalletInput(
      linkWalletInputParameters
    );
    if (!inputParametersValid) {
      setInputParametersValidation("invalid-input-parameters");
    }
    const initializeAndValidateInput = async (): Promise<void> => {
      await linkWalletServiceInst.initialize();
      if (abortController.signal.aborted) {
        return;
      }
      setInputParametersValidation("success");
    };
    initializeAndValidateInput();
    return () => abortController.abort();
  }, [linkWalletInputParameters, linkWalletServiceInst]);

  // automatically post the event as soon as the flow is complete
  useEffect(() => {
    if (!isFlowComplete || !walletToLinkPublicKey) {
      return;
    }
    linkWalletServiceInst.emitVerifyWithProof(walletToLinkPublicKey);
  }, [isFlowComplete, linkWalletServiceInst, walletToLinkPublicKey]);

  const onStepFailed = useCallback((stepNum) => {
    // reset the flow back to the start
    setStepFailed(stepNum);
  }, []);

  const resetSteps = useCallback(() => {
    multiWallet.disconnect().then(() => {
      setInputParametersValidation(undefined);
      setWalletToLinkPublicKey(undefined);
      setStepFailed(undefined);
      setSteps(setStepComplete(-1, steps));
    });
  }, [multiWallet, steps]);

  const onComplete = useCallback(async () => {
    clearStorageAndCookies();
    if (targetWindow) {
      targetWindow.focus();
      window.close();
    }
  }, [targetWindow]);

  const StepComponent = horizontalSteps ? HorizontalSteps : VerticalSteps;
  // TODO get these dialogs to look nicer once there is a shared, styled base dialog that accepts params in react-commons
  const { innerWidth, innerHeight } = window;
  return (
    <>
      <span className="block max-w-xl">
        To publicly link a wallet, prove you own it by connecting and signing a
        transaction.
      </span>
      {isFlowComplete && <Confetti width={innerWidth} height={innerHeight} />}
      {inputParametersValidation === "invalid-input-parameters" && (
        <BaseDialog
          isOpen
          title="Link Wallet Failed"
          onClose={undefined}
          contentClassName="max-w-md"
        >
          <div className="pb-5 text-center text-xl">
            <span data-testid="BAD_INPUT_PARAMETERS_DIALOG">
              Civic-link failed: the parameters used to initialize Civic-link 
              aren&apos;t correct. Please contact your dApp provider.
            </span>
          </div>
        </BaseDialog>
      )}
      {stepFailed !== undefined && (
        <BaseDialog
          isOpen={stepFailed !== undefined}
          onClose={() => null}
          contentClassName="max-w-md"
        >
          <>
            <div className="pb-5 text-center text-xl">
              The &quot;{steps[stepFailed].name}&quot; step couldn&apos;t be
              completed
            </div>
            <StyledRoundedCenteredButton
              type="button"
              onClick={resetSteps}
              className="mt-4 !px-16"
              disabled={false}
            >
              Start again
            </StyledRoundedCenteredButton>
          </>
        </BaseDialog>
      )}
      {steps && (
        <div className="my-6">
          <StepComponent
            withNumbers
            steps={[
              {
                ...steps[0],
                ...(walletToLinkPublicKey
                  ? {
                      name: `Connected ${getShortenedPublicKey(
                        walletToLinkPublicKey
                      )}`,
                    }
                  : {}),
                onStepClick: resetSteps,
                content: (
                  <ConnectWalletStep
                    setStepComplete={(walletPublicKey: unknown) => {
                      setWalletToLinkPublicKey(walletPublicKey as string);
                      updateStep(0);
                    }}
                    walletToConnectPublicKey={
                      linkWalletInputParameters.walletToLinkPublicKey
                    }
                    status={steps[0].status}
                    alreadyLinkedCheck={(keyToCheck: string) =>
                      keyToCheck ===
                      linkWalletInputParameters.existingAuthorityPublicKey
                        ? Promise.resolve(true)
                        : linkWalletServiceInst.isOwnershipFlagAlreadyPresent(
                            keyToCheck
                          )
                    }
                  />
                ),
              },
              {
                ...steps[1],
                content: walletToLinkPublicKey && (
                  <ProveWalletOwnership
                    linkWalletServiceInst={linkWalletServiceInst}
                    walletToLinkPublicKey={walletToLinkPublicKey}
                    status={steps[1].status}
                    setStepComplete={(signedTransaction: unknown) => {
                      setLinkWalletSignedTransaction(
                        signedTransaction as React.SetStateAction<
                          Transaction | undefined
                        >
                      );
                      updateStep(1);
                    }}
                    onStepFailed={() => onStepFailed(1)}
                  />
                ),
              },
              {
                ...steps[2],
                content: (
                  <ConnectWalletStep
                    walletToConnectPublicKey={
                      linkWalletInputParameters.existingAuthorityPublicKey
                    }
                    setStepComplete={() => updateStep(2)}
                    status={steps[2].status}
                  />
                ),
              },
              {
                ...steps[3],
                content: linkWalletSignedTransaction && (
                  <UpdateProfile
                    linkWalletServiceInst={linkWalletServiceInst}
                    linkWalletSignedTransaction={linkWalletSignedTransaction}
                    setStepComplete={() => {
                      updateStep(3);
                      setIsFlowComplete(true);
                    }}
                    status={steps[3].status}
                    onStepFailed={() => onStepFailed(3)}
                  />
                ),
              },
            ]}
          />
        </div>
      )}
      {isFlowComplete && (
        <BaseDialog
          isOpen={isFlowComplete}
          onClose={onComplete}
          contentClassName="max-w-md"
          withOverlay={false}
        >
          <>
            <div className="mb-4 flex flex-col items-center">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <CheckIcon className="h-8 w-8 text-white" aria-hidden="true" />
              </span>
            </div>
            <h3 className="text-center text-xl font-bold text-secondary">
              Wallet linked
            </h3>
            <div className="mt-6 mb-6 text-left">
              <span>
                Your wallet is now visible to the public. You can close this
                window to return to Civic.me.
              </span>
            </div>
            <StyledRoundedCenteredButton
              type="button"
              onClick={onComplete}
              className="mt-4 !px-8"
              disabled={false}
            >
              Close
            </StyledRoundedCenteredButton>
          </>
        </BaseDialog>
      )}
    </>
  );
}
LinkWalletWithOwnershipFlow.defaultProps = {
  horizontalSteps: false,
};
export default LinkWalletWithOwnershipFlow;
