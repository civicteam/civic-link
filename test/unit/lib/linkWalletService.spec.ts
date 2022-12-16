import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  DidSolDataAccount,
  DidSolService,
  DidSolDocument,
  BitwiseVerificationMethodFlag,
} from "@identity.com/sol-did-client";
import BN from "bn.js";
import { DIDDocument } from "did-resolver";
import {
  AnalyticsEventAction,
  AnalyticsEventCategory,
  CivicPostMessageApi,
  LinkEventType,
  LinkWalletInputParameters,
} from "../../../src/types";
import { LinkWalletService } from "../../../src/lib/linkWalletService";
import * as didLib from "../../../src/lib/did";
import { getDefaultFragment } from "../../../src/lib/did";

const existingAuthority = Keypair.generate();
const walletToLink = Keypair.generate();
const existingAuthorityPublicKey = existingAuthority.publicKey.toBase58();
const walletToLinkPublicKey = walletToLink.publicKey.toBase58();
const linkWalletInputParameters = {
  existingAuthorityPublicKey,
  existingAuthorityDid: `did:sol:devnet:${existingAuthorityPublicKey}`,
  flow: "verify-with-ownership",
  origin: "test-origin",
  rpcEndpoint: "https://api.devnet.solana.com",
  walletToLinkPublicKey,
} as LinkWalletInputParameters;
const linkFragment = getDefaultFragment(walletToLinkPublicKey);

// TODO use in future unit tests
// const didDocumentWithLinkedWallet = {
//   "@context": [`https://w3id.org/did/v1.0`, `https://w3id.org/sol/v2.0`],
//   controller: [],
//   verificationMethod: [
//     {
//       id: `did:sol:localnet:${existingAuthorityPublicKey}#default`,
//       type: `Ed25519VerificationKey2018`,
//       controller: `did:sol:localnet:${existingAuthorityPublicKey}`,
//       publicKeyBase58: `${existingAuthorityPublicKey}`,
//     },
//     {
//       id: `did:sol:localnet:${existingAuthorityPublicKey}#${linkFragment}`,
//       type: `Ed25519VerificationKey2018`,
//       controller: `did:sol:localnet:${existingAuthorityPublicKey}`,
//       publicKeyBase58: `${walletToLinkPublicKey}`,
//     },
//   ],
//   authentication: [],
//   assertionMethod: [],
//   keyAgreement: [],
//   capabilityInvocation: [
//     `did:sol:localnet:${existingAuthorityPublicKey}#default`,
//     `did:sol:localnet:${existingAuthorityPublicKey}#${linkFragment}`,
//   ],
//   capabilityDelegation: [],
//   service: [],
//   id: `did:sol:localnet:${existingAuthorityPublicKey}`,
// };

const rawLinkedDataAccount = {
  version: 0,
  bump: 254,
  nonce: new BN("00"),
  initialVerificationMethod: {
    fragment: "default",
    flags: 72,
    methodType: 0,
    keyData: existingAuthority.publicKey.toBytes(),
  },
  verificationMethods: [
    {
      fragment: linkFragment,
      flags: 72,
      methodType: 0,
      keyData: walletToLink.publicKey.toBytes(),
    },
  ],
  services: [],
  nativeControllers: [existingAuthority.publicKey] as PublicKey[],
  otherControllers: [],
};

let connection: Connection;
describe("linkWalletService", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    const getLatestBlockhashStub = jest.fn();
    getLatestBlockhashStub.mockResolvedValue({
      blockhash: "123",
      lastValidBlockHeight: 1234,
    });
    connection = {
      getLatestBlockhash: getLatestBlockhashStub,
    } as unknown as Connection;
  });

  describe("stepsMetaInfo", () => {
    it("should substitute linkWalletInputParameters correctly", () => {
      const linkWalletServiceInst = new LinkWalletService(
        {} as unknown as CivicPostMessageApi,
        linkWalletInputParameters,
        AnalyticsEventCategory.MakePublicWithOwnership,
        connection
      );

      expect(linkWalletServiceInst.stepsMetaInfo).toEqual([
        {
          name: `Connect <span class="font-semibold">${walletToLinkPublicKey.slice(
            0,
            4
          )}...${walletToLinkPublicKey.slice(-4)}</span>`,
          description: "",
          href: "#connectWalletToLink",
          status: "current",
        },
        {
          name: "Prove Wallet Ownership",
          description: "Sign a no-cost transaction to prove you own the wallet",
          href: "#proveWalletOwnership",
          status: "upcoming",
        },
        {
          name: `Reconnect login wallet <span class="font-semibold">${linkWalletInputParameters.existingAuthorityPublicKey.slice(
            0,
            4
          )}...${linkWalletInputParameters.existingAuthorityPublicKey.slice(
            -4
          )}</span>`,
          description: "",
          href: "#reconnectCivicMeWallet",
          status: "upcoming",
        },
        {
          name: "Update your Profile",
          description: "Sign a transaction to update your Civic.me profile",
          href: "#updateYourProfile",
          status: "upcoming",
        },
      ]);
    });
  });

  describe("emitStepCompleteAnalytics", () => {
    it("should post an analytics event referencing the step index name", () => {
      const postMessageSpy = jest.fn();
      const postMessageApi = {
        postMessage: postMessageSpy,
      };

      const linkWalletServiceInst = new LinkWalletService(
        postMessageApi as unknown as CivicPostMessageApi,
        linkWalletInputParameters,
        AnalyticsEventCategory.MakePublicWithOwnership,
        connection
      );

      linkWalletServiceInst.emitStepCompleteAnalytics(1);
      expect(postMessageSpy).lastCalledWith({
        eventType: LinkEventType.ANALYTICS,
        data: {
          category: AnalyticsEventCategory.MakePublicWithOwnership,
          action: AnalyticsEventAction.StepComplete,
          name: "#proveWalletOwnership",
        },
      });
    });
  });

  describe("emitVerifyWithProof", () => {
    describe("with a valid wallet and postMessageApi", () => {
      it("should post a VERIFY_WITH_OWNERSHIP_SUCCESS message", () => {
        const postMessageSpy = jest.fn();
        const postMessageApi = {
          postMessage: postMessageSpy,
        };

        const linkWalletServiceInst = new LinkWalletService(
          postMessageApi as unknown as CivicPostMessageApi,
          linkWalletInputParameters,
          AnalyticsEventCategory.MakePublicWithOwnership,
          connection
        );

        linkWalletServiceInst.emitVerifyWithProof(
          "test_linkededWalletPublicKey"
        );
        expect(postMessageSpy).lastCalledWith(
          {
            eventType: LinkEventType.VERIFY_WITH_OWNERSHIP_SUCCESS,
            data: {
              inputParameters: linkWalletInputParameters,
              linkededWalletPublicKey: "test_linkededWalletPublicKey",
            },
          },
          linkWalletInputParameters.origin
        );
      });
    });
  });

  describe("initialize", () => {
    let getDidAccountStub: jest.Mock<Promise<DidSolDataAccount | null>>;
    let resolveStub: jest.Mock<Promise<DIDDocument>>;
    beforeEach(() => {
      getDidAccountStub = jest.fn();
      resolveStub = jest.fn();
      jest.spyOn(DidSolService, "build").mockReturnValue({
        getDidAccount: getDidAccountStub,
        resolve: resolveStub,
      } as unknown as DidSolService);
    });

    it("should use the did service to retrieve a did data account", async () => {
      getDidAccountStub.mockResolvedValue(
        DidSolDataAccount.from(rawLinkedDataAccount, "localnet")
      );
      const linkWalletServiceInst = new LinkWalletService(
        {} as unknown as CivicPostMessageApi,
        linkWalletInputParameters,
        AnalyticsEventCategory.MakePublicWithOwnership,
        connection
      );

      await linkWalletServiceInst.initialize();

      expect(getDidAccountStub).toHaveBeenCalled();
    });

    // TODO write and uncomment CM-1722
    // it("should set the didDocument from the did data account if one exists", () => {});

    // it("if no did data account exists, should call service.resolve", () => {});
  });

  describe("proveOwnershipOfLinkedWallet", () => {
    let getDidAccountStub: jest.Mock<Promise<DidSolDataAccount | null>>;
    let resolveStub: jest.Mock<Promise<DIDDocument | undefined>>;
    let fromDocStub: jest.SpyInstance<
      DidSolDocument | undefined,
      [document: DIDDocument]
    >;
    const signTransaction = (tx: Transaction) => Promise.resolve(tx);
    beforeEach(() => {
      getDidAccountStub = jest.fn();
      resolveStub = jest.fn();
      jest.spyOn(DidSolService, "build").mockReturnValue({
        getDidAccount: getDidAccountStub,
        resolve: resolveStub,
      } as unknown as DidSolService);
      fromDocStub = jest.spyOn(DidSolDocument, "fromDoc");
    });

    describe("if initialization does not result in a didDocument", () => {
      it("should throw a DID Document must exist error", async () => {
        getDidAccountStub.mockResolvedValue(null);
        resolveStub.mockResolvedValue(undefined);
        fromDocStub.mockReturnValue(undefined);
        const linkWalletServiceInst = new LinkWalletService(
          {} as unknown as CivicPostMessageApi,
          linkWalletInputParameters,
          AnalyticsEventCategory.MakePublicWithOwnership,
          connection
        );

        expect(() =>
          linkWalletServiceInst.proveOwnershipOfLinkedWallet(
            walletToLinkPublicKey,
            signTransaction
          )
        ).rejects.toThrowError(
          "DID Document must exist to add ownership proof"
        );
      });
    });

    describe("with a good DIDDocument", () => {
      describe("with an existing fragment on the DID for the linked wallet", () => {
        let addFlagsToVerificationMethodStub: jest.SpyInstance<
          Promise<Transaction>,
          [
            inputParams: didLib.DidModificationParams & {
              flags: BitwiseVerificationMethodFlag[];
            }
          ]
        >;
        // let isDidRegisteredStub: jest.Mock<Promise<boolean>>;
        const addFlagsTx = new Transaction();
        beforeEach(() => {
          addFlagsToVerificationMethodStub = jest.spyOn(
            didLib,
            "addFlagsToVerificationMethod"
          );
          addFlagsToVerificationMethodStub.mockResolvedValue(addFlagsTx);
          jest.spyOn(didLib, "isDidRegistered").mockResolvedValue(true);
        });

        describe("with no verification method flags set", () => {
          beforeEach(() => {
            const dataAccountNoFlags = {
              ...rawLinkedDataAccount,
              verificationMethods: [
                {
                  ...rawLinkedDataAccount.verificationMethods[0],
                  flags: 0,
                },
              ],
            };
            getDidAccountStub.mockResolvedValue(
              DidSolDataAccount.from(dataAccountNoFlags, "localnet")
            );
          });

          it("should call addFlagsToVerificationMethod with capability and ownership flags", async () => {
            const linkWalletServiceInst = new LinkWalletService(
              {} as unknown as CivicPostMessageApi,
              linkWalletInputParameters,
              AnalyticsEventCategory.MakePublicWithOwnership,
              connection
            );
            const signTxSpy = jest.fn();
            await linkWalletServiceInst.proveOwnershipOfLinkedWallet(
              walletToLinkPublicKey,
              signTxSpy
            );
            expect(signTxSpy).lastCalledWith(addFlagsTx);
            expect(addFlagsToVerificationMethodStub).lastCalledWith({
              didIDToModify: linkWalletInputParameters.existingAuthorityDid,
              didOwnerWalletPublicKey:
                linkWalletInputParameters.existingAuthorityPublicKey,
              linkedWalletPublicKey: walletToLinkPublicKey,
              didDocument: linkWalletServiceInst.didDocument,
              keyAlias: undefined,
              connection,
              flags: [
                BitwiseVerificationMethodFlag.CapabilityInvocation,
                BitwiseVerificationMethodFlag.OwnershipProof,
              ],
            });
          });
        });

        describe("with only capability invocation flag set", () => {
          beforeEach(() => {
            const dataAccountNoFlags = {
              ...rawLinkedDataAccount,
              verificationMethods: [
                {
                  ...rawLinkedDataAccount.verificationMethods[0],
                  flags: BitwiseVerificationMethodFlag.CapabilityInvocation,
                },
              ],
            };
            getDidAccountStub.mockResolvedValue(
              DidSolDataAccount.from(dataAccountNoFlags, "localnet")
            );
          });
          it("should call addFlagsToVerificationMethod with only ownership flag", async () => {
            const linkWalletServiceInst = new LinkWalletService(
              {} as unknown as CivicPostMessageApi,
              linkWalletInputParameters,
              AnalyticsEventCategory.MakePublicWithOwnership,
              connection
            );
            const signTxSpy = jest.fn();
            await linkWalletServiceInst.proveOwnershipOfLinkedWallet(
              walletToLinkPublicKey,
              signTxSpy
            );
            expect(signTxSpy).lastCalledWith(addFlagsTx);
            expect(addFlagsToVerificationMethodStub).lastCalledWith({
              didIDToModify: linkWalletInputParameters.existingAuthorityDid,
              didOwnerWalletPublicKey:
                linkWalletInputParameters.existingAuthorityPublicKey,
              linkedWalletPublicKey: walletToLinkPublicKey,
              didDocument: linkWalletServiceInst.didDocument,
              keyAlias: undefined,
              connection,
              flags: [BitwiseVerificationMethodFlag.OwnershipProof],
            });
          });
        });

        describe("with only ownership flag set", () => {
          beforeEach(() => {
            const dataAccountNoFlags = {
              ...rawLinkedDataAccount,
              verificationMethods: [
                {
                  ...rawLinkedDataAccount.verificationMethods[0],
                  flags: BitwiseVerificationMethodFlag.OwnershipProof,
                },
              ],
            };
            getDidAccountStub.mockResolvedValue(
              DidSolDataAccount.from(dataAccountNoFlags, "localnet")
            );
          });
          it("should call addFlagsToVerificationMethod with only capability invocation flag", async () => {
            const linkWalletServiceInst = new LinkWalletService(
              {} as unknown as CivicPostMessageApi,
              linkWalletInputParameters,
              AnalyticsEventCategory.MakePublicWithOwnership,
              connection
            );
            const signTxSpy = jest.fn();
            await linkWalletServiceInst.proveOwnershipOfLinkedWallet(
              walletToLinkPublicKey,
              signTxSpy
            );
            expect(signTxSpy).lastCalledWith(addFlagsTx);
            expect(addFlagsToVerificationMethodStub).lastCalledWith({
              didIDToModify: linkWalletInputParameters.existingAuthorityDid,
              didOwnerWalletPublicKey:
                linkWalletInputParameters.existingAuthorityPublicKey,
              linkedWalletPublicKey: walletToLinkPublicKey,
              didDocument: linkWalletServiceInst.didDocument,
              keyAlias: undefined,
              connection,
              flags: [BitwiseVerificationMethodFlag.CapabilityInvocation],
            });
          });
        });
      });

      describe("with no existing fragment on the DID for the linked wallet", () => {
        let addVerificationMethodWithOwnershipProofStub: jest.SpyInstance<
          Promise<Transaction>,
          [inputParams: didLib.DidModificationParams]
        >;
        // let isDidRegisteredStub: jest.Mock<Promise<boolean>>;
        const addVMTx = new Transaction();
        beforeEach(() => {
          addVerificationMethodWithOwnershipProofStub = jest.spyOn(
            didLib,
            "addVerificationMethodWithOwnershipProof"
          );
          addVerificationMethodWithOwnershipProofStub.mockResolvedValue(
            addVMTx
          );
          jest.spyOn(didLib, "isDidRegistered").mockResolvedValue(true);

          const dataAccountNoVM = {
            ...rawLinkedDataAccount,
            verificationMethods: [],
          };
          getDidAccountStub.mockResolvedValue(
            DidSolDataAccount.from(dataAccountNoVM, "localnet")
          );
        });

        it("should call addVerificationMethodWithOwnershipProof", async () => {
          const linkWalletServiceInst = new LinkWalletService(
            {} as unknown as CivicPostMessageApi,
            linkWalletInputParameters,
            AnalyticsEventCategory.MakePublicWithOwnership,
            connection
          );
          const signTxSpy = jest.fn();
          await linkWalletServiceInst.proveOwnershipOfLinkedWallet(
            walletToLinkPublicKey,
            signTxSpy
          );
          expect(signTxSpy).lastCalledWith(addVMTx);
          expect(addVerificationMethodWithOwnershipProofStub).lastCalledWith({
            didIDToModify: linkWalletInputParameters.existingAuthorityDid,
            didOwnerWalletPublicKey:
              linkWalletInputParameters.existingAuthorityPublicKey,
            linkedWalletPublicKey: walletToLinkPublicKey,
            didDocument: linkWalletServiceInst.didDocument,
            keyAlias: undefined,
            connection,
          });
        });
      });
    });
  });
});
