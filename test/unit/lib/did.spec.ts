import { ReadOnlyRegistry, Registry } from "@civic/did-registry";
import { Execution } from "@civic/did-registry/dist/types";
import {
  BitwiseVerificationMethodFlag,
  DidSolDocument,
  DidSolService,
} from "@identity.com/sol-did-client";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import {
  addToDidRegistry,
  addVerificationMethodWithOwnershipProof,
  DidModificationParams,
  isDidRegistered,
  removeDidFromRegistry,
  removeVerificationMethod,
} from "../../../src/lib/did";

describe("did unit tests", () => {
  let loginDid: string;
  let loginKey: string;
  let existingKey: string;
  let keyToAdd: string;
  let sampleDidDocument: DidSolDocument;
  const returnedTransaction = new Transaction();

  beforeEach(async () => {
    // create keypairs for the DID and the key to link:
    loginKey = Keypair.generate().publicKey.toBase58();
    existingKey = Keypair.generate().publicKey.toBase58();
    keyToAdd = Keypair.generate().publicKey.toBase58();
    loginDid = `did:sol:localnet:${loginKey}`;
  });

  beforeEach(() => {
    sampleDidDocument = {
      verificationMethod: [
        {
          id: `did:sol:localnet:${loginKey}#default`,
          publicKeyBase58: loginKey,
        },
        {
          id: `did:sol:localnet:${loginKey}#otherkey`,
          publicKeyBase58: existingKey,
        },
      ],
    } as DidSolDocument;
    jest
      .spyOn(DidSolService.prototype, "resolve")
      .mockResolvedValue(sampleDidDocument);
    jest
      .spyOn(DidSolService.prototype, "addVerificationMethod")
      .mockReturnThis();
    jest
      .spyOn(DidSolService.prototype, "removeVerificationMethod")
      .mockReturnThis();
    jest
      .spyOn(DidSolService.prototype, "setVerificationMethodFlags")
      .mockReturnThis();
    jest.spyOn(DidSolService.prototype, "withAutomaticAlloc").mockReturnThis();
    jest
      .spyOn(DidSolService.prototype, "transaction")
      .mockResolvedValue(returnedTransaction);

    jest
      .spyOn(Registry.prototype, "listDIDs")
      .mockResolvedValue([`did:sol:localnet:${loginKey}`]);
    jest
      .spyOn(ReadOnlyRegistry.prototype, "listDIDs")
      .mockResolvedValue([`did:sol:localnet:${loginKey}`]);
    jest.spyOn(Registry.prototype, "close").mockReturnThis();
    jest.spyOn(Registry.prototype, "register").mockResolvedValue({
      transaction: async () => {
        return {
          instructions: [
            new TransactionInstruction({} as TransactionInstructionCtorFields),
          ],
        } as unknown as Promise<Transaction>;
      },
    } as unknown as Promise<Execution>);
    jest.spyOn(Registry.prototype, "remove").mockReturnValue({
      transaction: async () => {
        return {
          instructions: [
            new TransactionInstruction({} as TransactionInstructionCtorFields),
          ],
        } as unknown as Promise<Transaction>;
      },
    } as unknown as Execution);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("addVerificationMethodWithOwnershipProof tests", () => {
    it("should create a transaction adding the verification method and setting the ownership flag", async () => {
      const transaction = await addVerificationMethodWithOwnershipProof({
        didIDToModify: loginDid,
        didOwnerWalletPublicKey: loginKey,
        linkedWalletPublicKey: keyToAdd,
        didDocument: sampleDidDocument,
        keyAlias: "my-linked-wallet",
      } as DidModificationParams);
      expect(transaction).toEqual(returnedTransaction);
      // should have added the verification method
      expect(
        DidSolService.prototype.addVerificationMethod
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          keyData: new PublicKey(keyToAdd).toBytes(),
          fragment: "my-linked-wallet",
        }),
        new PublicKey(loginKey)
      );
      // should have set the flags
      expect(
        DidSolService.prototype.setVerificationMethodFlags
      ).toHaveBeenCalledWith(
        "my-linked-wallet",
        [
          BitwiseVerificationMethodFlag.CapabilityInvocation,
          BitwiseVerificationMethodFlag.OwnershipProof,
        ],
        new PublicKey(keyToAdd)
      );
    });

    it("should add verification method with ownership proof", async () => {
      const transaction = await addVerificationMethodWithOwnershipProof({
        didIDToModify: loginDid,
        didOwnerWalletPublicKey: loginKey,
        linkedWalletPublicKey: keyToAdd,
        didDocument: sampleDidDocument,
      } as DidModificationParams);
      expect(transaction).toEqual(returnedTransaction);
    });

    it("should fail to add a key with fragment that already exists", async () => {
      const shouldFail = addVerificationMethodWithOwnershipProof({
        didIDToModify: loginDid,
        didOwnerWalletPublicKey: loginKey,
        linkedWalletPublicKey: keyToAdd,
        didDocument: sampleDidDocument,
        keyAlias: "otherkey", // existing fragment
      } as DidModificationParams);
      expect(shouldFail).rejects.toThrowError(
        "The specified fragment already exists in DID document"
      );
    });
  });

  describe("removeVerificationMethod tests", () => {
    it("should remove verification method given an existing key", async () => {
      const transaction = await removeVerificationMethod({
        didIDToModify: loginDid,
        didOwnerWalletPublicKey: loginKey,
        linkedWalletPublicKey: existingKey,
      });
      expect(transaction).toEqual(returnedTransaction);
      // should have called the method to remove the verification method
      expect(
        DidSolService.prototype.removeVerificationMethod
      ).toHaveBeenCalledWith("otherkey", new PublicKey(loginKey));
    });

    it("should error if the key is not found in the verification methods", async () => {
      const shouldFail = removeVerificationMethod({
        didIDToModify: loginDid,
        didOwnerWalletPublicKey: loginKey,
        linkedWalletPublicKey: keyToAdd, // not in the DID document
      });
      expect(shouldFail).rejects.toThrowError(
        "The specified key is not found in DID document"
      );
    });
  });

  describe("isDidRegistered tests", () => {
    it("should return true when a DID has been registered", async () => {
      const connection = new Connection(clusterApiUrl("devnet"));
      const result = await isDidRegistered(keyToAdd, loginDid, connection);

      expect(result).toBeTruthy();
    });

    it("should return false when a DID has not been registered", async () => {
      const connection = new Connection(clusterApiUrl("devnet"));
      const result = await isDidRegistered(
        keyToAdd,
        `did:sol:localnet:${existingKey}`,
        connection
      );
      expect(result).toBeFalsy();
    });
  });

  describe("addToDidRegistry tests", () => {
    it("should add to the did registry", async () => {
      const connection = new Connection(clusterApiUrl("devnet"));
      const instructions = await addToDidRegistry(
        keyToAdd,
        `did:sol:localnet:${existingKey}`,
        connection,
        existingKey
      );

      expect(instructions.length).toEqual(1);
    });

    it("should fail to register a DID if it has been registered before", async () => {
      try {
        const connection = new Connection(clusterApiUrl("devnet"));
        await addToDidRegistry(keyToAdd, loginDid, connection, existingKey);
      } catch (error) {
        expect((error as Error).message).toEqual(
          "DID already exists in the registry"
        );
        return;
      }

      throw new Error("Should have thrown an error");
    });
  });

  describe("removeDidFromRegistry tests", () => {
    it("should remove the did from the registry", async () => {
      const connection = new Connection(clusterApiUrl("devnet"));
      const instructions = await removeDidFromRegistry(
        keyToAdd,
        loginDid,
        connection,
        existingKey
      );

      expect(instructions.length).toEqual(1);
    });

    it("should fail to register a DID if it has been registered before", async () => {
      try {
        const connection = new Connection(clusterApiUrl("devnet"));
        await removeDidFromRegistry(
          keyToAdd,
          `did:sol:localnet:${existingKey}`,
          connection,
          existingKey
        );
      } catch (error) {
        expect((error as Error).message).toEqual("DID not found in registry");
        return;
      }

      throw new Error("Should have thrown an error");
    });
  });
});
