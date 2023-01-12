import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import queryString from "query-string";
import * as R from "ramda";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  AlreadyLinkedDialog,
  WalletLinkingInProgress,
  ConfirmLinkingDialog,
} from "../dialogs";
import {
  ChainType,
  IncomingEvent,
  LinkEventType,
  LinkWalletInputParameters,
  WalletType,
  FlowType,
} from "../../types";
import { useMultiWallet } from "./XChainWalletProvider";
import { removeVerificationMethod } from "../../lib";
import { useCivicPostMessageApi } from "./PostMessageProvider";

export interface WalletLinkContext {
  isWalletLinkingInProgress: boolean;
  openLinkWalletPage: (
    flow: FlowType,
    walletToLinkPublicKey?: string,
    rpcEndpoint?: string
  ) => void;
  validateAlreadyLinkedAddress: (arg: string) => Promise<string>;
  successfullyAddedWalletToDidPromise: Promise<string> | undefined;
  makeLinkedWalletPrivate: (
    toRemovePublicKey: string,
    connection: Connection
  ) => Promise<void>;
}

export const WalletLinkingContext = createContext<WalletLinkContext>(
  {} as WalletLinkContext
);

export function useWalletLinking(): WalletLinkContext {
  return useContext(WalletLinkingContext);
}

type SparseWallet = {
  publicKey: string;
  chains: ChainType[];
  type: WalletType;
};

type OwnProps = {
  // addWalletAddress: (address: string) => void;
  existingWalletAddresses: string[];
  civicLinkUrl: string;
  postMessageOrigin: string;
};

export default function WalletLinkingProvider({
  // addWalletAddress,
  existingWalletAddresses,
  civicLinkUrl,
  postMessageOrigin,
  children,
}: PropsWithChildren<OwnProps>): ReactElement {
  const { wallet, selectedProviderWallet } = useMultiWallet();
  const openPopup = (url: string) => {
    const newwindow = window.open(url, "_blank");
    if (!!window.focus && newwindow) {
      newwindow.focus();
    }
    return false;
  };
  const [currentFlowType, setCurrentFlowType] = useState<FlowType>();
  const [alreadyLinkedAddress, setAlreadyLinkedAddress] = useState<string>("");

  const [
    successfullyAddedWalletToDidPromise,
    setSuccessfullyAddedWalletToDidPromise,
  ] = useState<Promise<string>>();
  const [isWalletLinkingInProgress, setIsWalletLinkingInProgress] =
    useState<boolean>(false);
  const [stagedWallets, setStagedWallets] = useState<SparseWallet[]>([]);

  const [isChangeWalletDialogVisible, setIsChangeWalletDialogVisible] =
    useState<boolean>(false);

  const { postMessageApi } = useCivicPostMessageApi();

  const resetState = useCallback(() => {
    setStagedWallets([]);
    setIsWalletLinkingInProgress(false);
    setSuccessfullyAddedWalletToDidPromise(undefined);
  }, []);

  const openLinkWalletPage = useCallback(
    (flow: FlowType, walletToLinkPublicKey?: string, rpcEndpoint?: string) => {
      setStagedWallets([]);
      setCurrentFlowType(flow);
      setIsWalletLinkingInProgress(true);
      if (wallet.publicKey && wallet.did) {
        const linkWalletParams: LinkWalletInputParameters = {
          existingAuthorityPublicKey: wallet.publicKey,
          existingAuthorityDid: wallet.did,
          flow,
          origin: postMessageOrigin,
          ...(rpcEndpoint ? { rpcEndpoint } : {}),
          ...(walletToLinkPublicKey ? { walletToLinkPublicKey } : {}),
        };

        openPopup(`${civicLinkUrl}?${queryString.stringify(linkWalletParams)}`);
      }
    },
    [wallet.publicKey, wallet.did, postMessageOrigin, civicLinkUrl]
  );

  const makeLinkedWalletPrivate = useCallback(
    async (
      toRemovePublicKey: string,
      connection: Connection
    ): Promise<void> => {
      if (!wallet.did || !wallet.publicKey) {
        throw new Error("Wallet needs a DID and publicKey defined");
      }
      const txToSend = await removeVerificationMethod({
        didIDToModify: wallet.did,
        didOwnerWalletPublicKey: wallet.publicKey,
        linkedWalletPublicKey: toRemovePublicKey,
        connection,
      });
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      txToSend.feePayer = new PublicKey(wallet.publicKey);
      txToSend.recentBlockhash = blockhash;
      const signedTransaction = await wallet.signTransaction(txToSend);

      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );
    },
    [wallet]
  );

  const postMessageCallback = useCallback(
    async (evt: any) => {
      const { eventType, data } = evt as IncomingEvent;
      if (
        currentFlowType === FlowType.LOCAL &&
        eventType === LinkEventType.WALLET_CONNECTED &&
        data?.publicKey
      ) {
        if (existingWalletAddresses.includes(data?.publicKey)) {
          setAlreadyLinkedAddress(data?.publicKey);
        } else {
          setIsWalletLinkingInProgress(false);
          setIsChangeWalletDialogVisible(true);
          const newStagedWallets = Array.from(stagedWallets).concat([
            {
              publicKey: data?.publicKey,
              chains: [ChainType.SOLANA],
              type: WalletType.Local,
            },
          ]);
          setStagedWallets(newStagedWallets);
        }
      } else if (
        currentFlowType === FlowType.VERIFY_WITH_OWNERSHIP &&
        eventType === LinkEventType.VERIFY_WITH_OWNERSHIP_SUCCESS &&
        data?.linkededWalletPublicKey
      ) {
        setIsWalletLinkingInProgress(false);
        setSuccessfullyAddedWalletToDidPromise(
          Promise.resolve(data?.linkededWalletPublicKey)
        );
        resetState();
      }
    },
    [currentFlowType, existingWalletAddresses, resetState, stagedWallets]
  );

  useEffect(() => {
    if (postMessageApi) {
      postMessageApi.addEventListener(postMessageCallback);
    }
    return () =>
      postMessageApi && postMessageApi.removeEventListener(postMessageCallback);
  }, [postMessageApi, postMessageCallback]);

  const validateAlreadyLinkedAddress = useCallback(
    (address: string): Promise<string> => {
      return new Promise((resolve) => {
        if (!existingWalletAddresses.includes(address)) {
          resolve(address);
        } else {
          setAlreadyLinkedAddress(address);
        }
      });
    },
    [existingWalletAddresses]
  );

  const onSave = useCallback(async () => {
    const newLinkedWallets = stagedWallets.map(R.prop("publicKey")) as string[];
    // const addWalletPromises = newLinkedWallets.map(addWalletAddress);

    // await Promise.all(addWalletPromises);
    setStagedWallets([]);
  }, [stagedWallets]);

  const value = useMemo(
    () => ({
      isWalletLinkingInProgress,
      openLinkWalletPage,
      validateAlreadyLinkedAddress,
      successfullyAddedWalletToDidPromise,
      makeLinkedWalletPrivate,
    }),
    [
      isWalletLinkingInProgress,
      openLinkWalletPage,
      validateAlreadyLinkedAddress,
      successfullyAddedWalletToDidPromise,
      makeLinkedWalletPrivate,
    ]
  );

  return (
    <WalletLinkingContext.Provider value={value}>
      <WalletLinkingInProgress
        isOpen={isWalletLinkingInProgress}
        onClose={resetState}
      />
      {wallet.publicKey &&
        selectedProviderWallet.publicKey &&
        stagedWallets && (
          <ConfirmLinkingDialog
            isOpen={isChangeWalletDialogVisible}
            onClose={() => {
              setStagedWallets([]);
              setIsChangeWalletDialogVisible(false);
            }}
            loginWalletAddress={wallet.publicKey}
            stagedWallets={stagedWallets.map(R.prop("publicKey"))}
            onOk={() => {
              setIsChangeWalletDialogVisible(false);
              onSave();
            }}
            selectedWalletPublicKey={selectedProviderWallet.publicKey}
          />
        )}

      <AlreadyLinkedDialog
        isOpen={!!alreadyLinkedAddress}
        onClose={() => setAlreadyLinkedAddress("")}
        walletAddress={alreadyLinkedAddress}
      />

      {children}
    </WalletLinkingContext.Provider>
  );
}
