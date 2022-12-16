import {
  getShortenedPublicKey,
  StepWrapper,
  RoundedButton,
} from "@civic/react-commons";
import type { StepProps } from "@civic/react-commons";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import CheckCircleIcon from "../../assets/img/icons/CheckCircle.svg";
import { clearStorageAndCookies } from "../../lib/windowUtils";
import { useMultiWallet } from "../providers";
import SelectWalletInfo from "../../assets/img/icons/SelectWalletInfo.svg";

type OwnProps = StepProps & {
  walletToConnectPublicKey?: string;
  alreadyLinkedCheck?: (walletToLinkPublicKey: string) => Promise<boolean>;
};

export default function ConnectWalletStep({
  walletToConnectPublicKey,
  setStepComplete,
  alreadyLinkedCheck,
  status,
}: PropsWithChildren<OwnProps>): React.ReactElement {
  const { wallet: multiWallet, selectChain } = useMultiWallet();

  const [walletAlreadyLinked, setWalletAlreadyLinked] =
    useState<boolean>(false);
  const disconnectWallet = useCallback(() => {
    return multiWallet.disconnect();
  }, [multiWallet]);

  const connectWallet = useCallback(() => {
    clearStorageAndCookies();
    selectChain();
  }, [selectChain]);

  // if we require a specific public key to be connected, then only continue when it's connected
  // otherwise, we need the user to explicitly click Continue
  const autoContinueEnabled = useMemo(
    () =>
      walletToConnectPublicKey
        ? !!(
            multiWallet.publicKey &&
            multiWallet.publicKey === walletToConnectPublicKey
          )
        : false,
    [multiWallet.publicKey, walletToConnectPublicKey]
  );

  useEffect(() => {
    const abortController = new AbortController();
    const checkAlreadyLinked = async () => {
      if (multiWallet.publicKey) {
        if (alreadyLinkedCheck) {
          const isAlreadyLinked = await alreadyLinkedCheck(
            multiWallet.publicKey
          );
          if (abortController.signal.aborted) {
            return;
          }
          setWalletAlreadyLinked(isAlreadyLinked);
        }
      }
    };
    checkAlreadyLinked();
    return () => abortController.abort();
  }, [alreadyLinkedCheck, multiWallet.publicKey]);

  useEffect(() => {
    if (multiWallet.publicKey && autoContinueEnabled) {
      setStepComplete(multiWallet.publicKey);
    }
  }, [autoContinueEnabled, multiWallet.publicKey, setStepComplete]);

  return (
    <StepWrapper
      isContinueEnabled={() => autoContinueEnabled}
      showContinue={false}
      setStepComplete={setStepComplete}
      status={status}
    >
      <div className="mt-4 font-normal">
        <div className="mb-2">
          {multiWallet.publicKey && (
            <>
              {!walletToConnectPublicKey && walletAlreadyLinked ? (
                <span>Currently connected wallet already linked: </span>
              ) : (
                <span>Currently connected wallet: </span>
              )}
              {getShortenedPublicKey(multiWallet.publicKey)}
              {multiWallet.name && (
                <span className="font-semibold">
                  &nbsp;({multiWallet.name})
                </span>
              )}
            </>
          )}
          {autoContinueEnabled && <CheckCircleIcon stroke="green" />}
        </div>
        {!multiWallet.publicKey && !multiWallet.connected && (
          <RoundedButton
            onClick={connectWallet}
            variant="medium"
            loading={multiWallet.connecting}
          >
            <span>Connect Wallet</span>
          </RoundedButton>
        )}

        {multiWallet.publicKey &&
          (multiWallet.connected || multiWallet.connecting) && (
            <>
              {!walletToConnectPublicKey && !autoContinueEnabled && (
                <RoundedButton
                  type="button"
                  variant="medium"
                  onClick={() => setStepComplete(multiWallet.publicKey)}
                  disabled={walletAlreadyLinked}
                >
                  <span>Continue</span>
                </RoundedButton>
              )}
              <div className="mt-4">
                <div className="mb-1">
                  You can select a different wallet from your wallet app
                </div>
                <SelectWalletInfo />
                <div className="mt-1">
                  If the wallet to link is in a different app,{" "}
                  <a
                    href="#changeProvider"
                    onClick={(evt) => {
                      evt.preventDefault();
                      disconnectWallet().then(connectWallet);
                    }}
                    className="font-bold text-secondary"
                  >
                    switch wallet app
                  </a>{" "}
                </div>
              </div>
            </>
          )}
      </div>
    </StepWrapper>
  );
}

ConnectWalletStep.defaultProps = {
  walletToConnectPublicKey: undefined,
  alreadyLinkedCheck: undefined,
};
