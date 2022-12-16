/* eslint-disable no-param-reassign */
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  DidSolIdentifier,
  DID_SOL_PROGRAM,
} from "@identity.com/sol-did-client";
import { DID_REGISTRY_PROGRAM_ID } from "@civic/did-registry/dist/lib/constants";
import * as R from "ramda";
import {
  AnalyticsEventCategory,
  CivicPostMessageApi,
  LinkWalletInputParameters,
} from "../../../src/types";
import { LinkWalletService } from "../../../src/lib/linkWalletService";
import { airdrop, localnetCluster, localnetClusterUrl } from "../utils";
import { addVerificationMethodWithOwnershipProof } from "../../../src/lib/did";

const connection = new Connection(localnetClusterUrl);

let linkWalletInputParameters: LinkWalletInputParameters;
const testTimeout = 100000;

describe("link wallet service integration tests", () => {
  jest.setTimeout(testTimeout);
  let existingAuthorityPublicKey: string;
  let walletToLinkPublicKey: string;
  let existingAuthorityDid: string;
  let loginKeypair: Keypair;
  let walletToLinkKeypair: Keypair;
  let firstKeypairToAdd: Keypair;
  beforeEach(() => {
    loginKeypair = Keypair.generate();
    walletToLinkKeypair = Keypair.generate();
    existingAuthorityPublicKey = loginKeypair.publicKey.toBase58();
    walletToLinkPublicKey = walletToLinkKeypair.publicKey.toBase58();
    firstKeypairToAdd = Keypair.generate();
    existingAuthorityDid = DidSolIdentifier.create(
      loginKeypair.publicKey,
      localnetCluster
    ).toString();
    linkWalletInputParameters = {
      existingAuthorityPublicKey,
      existingAuthorityDid,
      flow: "verify-with-ownership",
      origin: "test-origin",
      rpcEndpoint: localnetClusterUrl,
      walletToLinkPublicKey,
    } as LinkWalletInputParameters;
  });

  describe("initialize", () => {
    describe("with no did data account existing", () => {
      it("should still resolve a did document", async () => {
        const linkWalletServiceInst = new LinkWalletService(
          {} as unknown as CivicPostMessageApi,
          linkWalletInputParameters,
          AnalyticsEventCategory.MakePublicWithOwnership,
          connection
        );
        await linkWalletServiceInst.initialize();

        expect(linkWalletServiceInst.didDocument).toEqual(
          expect.objectContaining({
            id: existingAuthorityDid,
            capabilityInvocation: [`${existingAuthorityDid}#default`],
            verificationMethod: [
              {
                controller: existingAuthorityDid,
                id: `${existingAuthorityDid}#default`,
                publicKeyBase58: existingAuthorityPublicKey,
                type: "Ed25519VerificationKey2018",
              },
            ],
          })
        );
      });
    });

    describe("with a did data account existing", () => {
      beforeEach(async () => {
        // airdrop to the login wallet
        await airdrop(connection, new PublicKey(existingAuthorityPublicKey));

        // add first key
        const transaction = await addVerificationMethodWithOwnershipProof({
          didIDToModify: existingAuthorityDid,
          didOwnerWalletPublicKey: existingAuthorityPublicKey,
          linkedWalletPublicKey: firstKeypairToAdd.publicKey.toBase58(),
          didDocument: undefined, // let the function retreive the DID document
          keyAlias: undefined, // do not specify the alias
          connection,
        });
        await sendAndConfirmTransaction(connection, transaction, [
          loginKeypair,
          firstKeypairToAdd,
        ]);
      });

      it("should initialize with a data account", async () => {
        const linkWalletServiceInst = new LinkWalletService(
          {} as unknown as CivicPostMessageApi,
          linkWalletInputParameters,
          AnalyticsEventCategory.MakePublicWithOwnership,
          connection
        );
        await linkWalletServiceInst.initialize();

        expect(linkWalletServiceInst.didSolDataAccount).toBeTruthy();
      });

      describe("isOwnershipFlagAlreadyPresent", () => {
        it("should return true with an already linked public key", async () => {
          const linkWalletServiceInst = new LinkWalletService(
            {} as unknown as CivicPostMessageApi,
            linkWalletInputParameters,
            AnalyticsEventCategory.MakePublicWithOwnership,
            connection
          );

          const isLinked =
            await linkWalletServiceInst.isOwnershipFlagAlreadyPresent(
              firstKeypairToAdd.publicKey.toBase58()
            );

          expect(isLinked).toBeTruthy();
        });

        it("should return false with a non-linked public key", async () => {
          const linkWalletServiceInst = new LinkWalletService(
            {} as unknown as CivicPostMessageApi,
            linkWalletInputParameters,
            AnalyticsEventCategory.MakePublicWithOwnership,
            connection
          );

          const isLinked =
            await linkWalletServiceInst.isOwnershipFlagAlreadyPresent(
              Keypair.generate().publicKey.toBase58()
            );

          expect(isLinked).toBeFalsy();
        });
      });
    });

    describe("proveOwnershipOfLinkedWallet", () => {
      describe("with a non-registered linked-wallet with an register instruction", () => {
        it("should return a transaction that can be used to update a profile with no register instruction", async () => {
          const linkWalletServiceInst = new LinkWalletService(
            {} as unknown as CivicPostMessageApi,
            linkWalletInputParameters,
            AnalyticsEventCategory.MakePublicWithOwnership,
            connection
          );

          const tx = await linkWalletServiceInst.proveOwnershipOfLinkedWallet(
            walletToLinkPublicKey,
            (transaction) => {
              transaction.sign(walletToLinkKeypair);
              return Promise.resolve(transaction);
            }
          );

          expect(tx.instructions.length).toEqual(5);
          R.slice(0, 3, tx.instructions).map(({ programId }) =>
            expect(programId).toEqual(DID_SOL_PROGRAM)
          );
          R.slice(3, 5, tx.instructions).map(({ programId }) =>
            expect(programId).toEqual(DID_REGISTRY_PROGRAM_ID)
          );
        });
      });

      // TODO CM-1722 re-enable when debugged and working
      // describe("with registered linked-wallet", () => {
      //   it.only("should return a transaction that can be used to update a profile with no register instruction", async () => {
      //     await airdrop(connection, loginKeypair.publicKey);
      //     await airdrop(connection, walletToLinkKeypair.publicKey);

      //     const registerIx = await addToDidRegistry(
      //       walletToLinkPublicKey,
      //       existingAuthorityDid.toString(),
      //       connection,
      //       existingAuthorityPublicKey,
      //       localnetCluster
      //     );
      //     const addToRegisterTx = new Transaction();
      //     addToRegisterTx.add(...registerIx);

      //     await sendAndConfirmTransaction(connection, addToRegisterTx, [
      //       loginKeypair,
      //       walletToLinkKeypair,
      //     ]);

      //     const linkWalletServiceInst = new LinkWalletService(
      //       {} as unknown as CivicPostMessageApi,
      //       linkWalletInputParameters,
      //       AnalyticsEventCategory.MakePublicWithOwnership,
      //       connection
      //     );

      //     const tx = await linkWalletServiceInst.proveOwnershipOfLinkedWallet(
      //       walletToLinkPublicKey,
      //       (transaction) => {
      //         transaction.sign(walletToLinkKeypair);
      //         return Promise.resolve(transaction);
      //       }
      //     );

      //     expect(tx.instructions.length).toEqual(3);
      //     R.slice(0, 3, tx.instructions).map(({ programId }) =>
      //       expect(programId).toEqual(DID_SOL_PROGRAM)
      //     );
      //   });
      // });
    });
  });
});
