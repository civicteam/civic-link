/* eslint-disable no-console */
import { getShortenedPublicKey, StepStatus } from "@civic/react-commons";
import type { Step } from "@civic/react-commons";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  BitwiseVerificationMethodFlag,
  DidSolDataAccount,
  DidSolDocument,
  DidSolIdentifier,
  DidSolService,
} from "@identity.com/sol-did-client";
import * as R from "ramda";
import {
  AddWalletToDidSuccessPayload,
  AnalyticsEventAction,
  AnalyticsEventCategory,
  CivicPostMessageApi,
  LinkEventType,
  LinkWalletInputParameters,
} from "../types";
import {
  addFlagsToVerificationMethod,
  addToDidRegistry,
  addVerificationMethodWithOwnershipProof,
  getLinkedWalletFragment,
  isDidRegistered,
  isVerificationMethodFlagPresent,
} from "./did";

const missingFlagsForPublicKey = (
  walletToLinkPublicKey: string,
  didSolDataAccount: DidSolDataAccount | null
) => {
  return [
    BitwiseVerificationMethodFlag.CapabilityInvocation,
    BitwiseVerificationMethodFlag.OwnershipProof,
  ]
    .map((flag) =>
      isVerificationMethodFlagPresent(
        walletToLinkPublicKey,
        flag,
        didSolDataAccount
      )
        ? null
        : flag
    )
    .filter(R.complement(R.isNil));
};
const logDebug = (message: string, args?: unknown) =>
  args
    ? console.log(`[LinkWalletService] ${message}`, args)
    : console.log(`[LinkWalletService] ${message}`);
export class LinkWalletService {
  public didDocument: DidSolDocument | null = null;

  public didService: DidSolService | null = null;

  public didSolDataAccount: DidSolDataAccount | null = null;

  private isInitialized: boolean = false;

  private currentStep = 0;

  constructor(
    private postMessageApi: CivicPostMessageApi,
    private linkWalletInputParameters: LinkWalletInputParameters,
    private analyticsCategory: AnalyticsEventCategory,
    private connection: Connection
  ) {}

  /**
   * Try to retrieve a didSolData account, then use it to create a DIDDocument
   * that can be used in sevice calls. If the data account doesn't exist,
   * then resolve the did document using the service directly
   */
  public async initialize(): Promise<void> {
    // create the DID service for existing DID Authority
    const service = DidSolService.build(
      DidSolIdentifier.parse(
        this.linkWalletInputParameters.existingAuthorityDid
      ),
      { connection: this.connection }
    );
    this.didService = service;

    // retrieve the data account as this contains 'extra' information on flags used by identity
    // such as ownership
    this.didSolDataAccount = await this.didService.getDidAccount();
    logDebug("initialize, didSolDataAccount", this.didSolDataAccount);

    // create a did document, using the already-retrieved didSolDataAccount if it exists, otherwise, resolve
    this.didDocument =
      this.didSolDataAccount !== null
        ? DidSolDocument.from(this.didSolDataAccount)
        : await this.didService
            .resolve()
            .then(DidSolDocument.fromDoc)
            .catch((error) => {
              throw new Error(`DIDDocument could not be resolved: ${error}`);
            });

    logDebug("initialize, did document resolved", this.didDocument);
    this.isInitialized = true;
  }

  public get stepsMetaInfo(): Step[] {
    const connectOrConnected = this.currentStep > 0 ? "Connected" : "Connect";
    const initialConnectWalletStepName = this.linkWalletInputParameters
      .walletToLinkPublicKey
      ? `${connectOrConnected} <span class="font-semibold">${getShortenedPublicKey(
          this.linkWalletInputParameters.walletToLinkPublicKey
        )}</span>`
      : `${connectOrConnected} wallet to link`;

    return [
      {
        name: initialConnectWalletStepName,
        description: "",
        href: "#connectWalletToLink",
        status: StepStatus.current,
      },
      {
        name: `${this.currentStep > 1 ? "Proved" : "Prove"} Wallet Ownership`,
        description: `Sign a no-cost transaction to prove you own the wallet`,
        href: "#proveWalletOwnership",
        status: StepStatus.upcoming,
      },
      {
        name: `${
          this.currentStep > 2 ? "Reconnected" : "Reconnect"
        } login wallet <span class="font-semibold">${getShortenedPublicKey(
          this.linkWalletInputParameters.existingAuthorityPublicKey
        )}</span>`,
        description: "",
        href: "#reconnectCivicMeWallet",
        status: StepStatus.upcoming,
      },
      {
        name: `${this.currentStep > 3 ? "Updated" : "Update"} your Profile`,
        description: `Sign a transaction to update your Civic.me profile`,
        href: "#updateYourProfile",
        status: StepStatus.upcoming,
      },
    ];
  }

  /**
   * Emit an event that a step in the link wallet process has finished
   * @param stepIndex
   */
  public emitStepCompleteAnalytics(stepIndex: number): void {
    this.currentStep = stepIndex + 1;
    if (this.linkWalletInputParameters.origin) {
      this.postMessageApi.postMessage({
        eventType: LinkEventType.ANALYTICS,
        data: {
          category: this.analyticsCategory,
          action: AnalyticsEventAction.StepComplete,
          name: this.stepsMetaInfo[stepIndex].href,
        },
      });
    }
  }

  /**
   * Emit a post-wallet api event that the linked wallet has been succesfully added to the did, with the ownership flag set
   */
  public emitVerifyWithProof(linkededWalletPublicKey: string): void {
    if (this.linkWalletInputParameters.origin) {
      const verifyWithProofEvent = {
        eventType: LinkEventType.VERIFY_WITH_OWNERSHIP_SUCCESS,
        data: {
          inputParameters: this.linkWalletInputParameters,
          linkededWalletPublicKey,
        } as AddWalletToDidSuccessPayload,
      };

      this.postMessageApi.postMessage(
        verifyWithProofEvent,
        this.linkWalletInputParameters.origin
      );
    }
  }

  /**
   * Check if the provided key already has an ownership proof verification method flag
   * @param {string} publicKey
   * @returns boolean
   */
  public async isOwnershipFlagAlreadyPresent(
    publicKey: string
  ): Promise<boolean> {
    if (!this.didSolDataAccount) {
      await this.initialize();
    }
    const ownershipFlagExistsForKey = isVerificationMethodFlagPresent(
      publicKey,
      BitwiseVerificationMethodFlag.OwnershipProof,
      this.didSolDataAccount
    );
    logDebug("ownershipFlagExistsForKey", {
      publicKey,
      ownershipFlagExistsForKey,
      didSolDataAccount: this.didSolDataAccount,
    });
    return ownershipFlagExistsForKey;
  }

  /**
   * create a TX to add or update the verification method with ownership proof and sign it
   * @param {string} walletToLinkPublicKey
   * @param {(transaction: Transaction) => Promise<Transaction>} signTransaction
   * @returns {Promise<Transaction>}
   */
  public async proveOwnershipOfLinkedWallet(
    walletToLinkPublicKey: string,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<Transaction> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    if (!this.didDocument) {
      throw new Error("DID Document must exist to add ownership proof");
    }

    const fragment = getLinkedWalletFragment(
      walletToLinkPublicKey,
      this.didDocument
    );
    let transaction: Transaction;
    const verificationMethodParameters = {
      didIDToModify: this.linkWalletInputParameters.existingAuthorityDid,
      didOwnerWalletPublicKey:
        this.linkWalletInputParameters.existingAuthorityPublicKey,
      linkedWalletPublicKey: walletToLinkPublicKey,
      didDocument: this.didDocument,
      keyAlias: undefined, // do not specify the key alias
      connection: this.connection,
    };
    if (fragment) {
      const missingFlags = missingFlagsForPublicKey(
        walletToLinkPublicKey,
        this.didSolDataAccount
      );

      if (R.isEmpty(missingFlags)) {
        throw new Error(
          "All ownership flags already present on DID for public key"
        );
      }
      transaction = await addFlagsToVerificationMethod({
        ...verificationMethodParameters,
        flags: missingFlags,
      });
    } else {
      transaction = await addVerificationMethodWithOwnershipProof(
        verificationMethodParameters
      );
    }

    const { clusterType } = DidSolIdentifier.parse(
      this.linkWalletInputParameters.existingAuthorityDid
    );

    const isRegistered = await isDidRegistered(
      walletToLinkPublicKey,
      this.linkWalletInputParameters.existingAuthorityDid,
      this.connection,
      clusterType
    );

    if (!isRegistered) {
      const didRegistryInstructions = await addToDidRegistry(
        walletToLinkPublicKey,
        this.linkWalletInputParameters.existingAuthorityDid,
        this.connection,
        this.linkWalletInputParameters.existingAuthorityPublicKey,
        clusterType
      );

      transaction.add(...didRegistryInstructions);
    }

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(
      this.linkWalletInputParameters.existingAuthorityPublicKey
    );
    return signTransaction(transaction);
  }

  public async signAndSendUpdateDidTransaction(
    linkWalletSignedTransaction: Transaction,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<void> {
    const signedTransaction = await signTransaction(
      linkWalletSignedTransaction
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );
    await this.connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );
  }
}
