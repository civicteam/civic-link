import {
  BitwiseVerificationMethodFlag,
  DidSolIdentifier,
  DidSolService,
  Wallet,
} from "@identity.com/sol-did-client";
import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { getShortenedPublicKey } from "@civic/react-commons";
import { Registry } from "@civic/did-registry";
import { airdrop, localnetCluster, localnetClusterUrl } from "../utils";
import {
  addToDidRegistry,
  addVerificationMethodWithOwnershipProof,
  removeDidFromRegistry,
  removeVerificationMethod,
} from "../../../src/lib/did";

const testTimeout = 100000;

describe("did integration tests", () => {
  let loginDid: DidSolIdentifier;
  let loginKeypair: Keypair;
  let keypairToAdd: Keypair;
  let connection: Connection;

  beforeEach(async () => {
    // create keypairs for the DID and the key to link:
    loginKeypair = Keypair.generate();
    keypairToAdd = Keypair.generate();
    loginDid = DidSolIdentifier.create(loginKeypair.publicKey, localnetCluster);
    connection = new Connection(localnetClusterUrl);
  });

  describe("addVerificationMethodWithOwnershipProof tests", () => {
    it(
      "should add a verification method with ownership proof",
      async () => {
        // airdrop to the login wallet
        await airdrop(connection, loginKeypair.publicKey);

        // build the transaction to add the key
        const transaction = await addVerificationMethodWithOwnershipProof({
          didIDToModify: loginDid.toString(),
          didOwnerWalletPublicKey: loginKeypair.publicKey.toBase58(),
          linkedWalletPublicKey: keypairToAdd.publicKey.toBase58(),
          didDocument: undefined, // let the function retreive the DID document
          keyAlias: "my-linked-wallet",
          connection,
        });

        // send the transaction
        await sendAndConfirmTransaction(connection, transaction, [
          loginKeypair,
          keypairToAdd,
        ]);

        // resolve did document
        const service = DidSolService.build(loginDid, { connection });
        const didDocument = await service.resolve();
        expect(didDocument.verificationMethod).toHaveLength(2);
        expect(didDocument.verificationMethod).toEqual([
          expect.objectContaining({
            id: `${loginDid}#default`,
            publicKeyBase58: loginKeypair.publicKey.toBase58(),
          }),
          expect.objectContaining({
            id: `${loginDid}#my-linked-wallet`,
            publicKeyBase58: keypairToAdd.publicKey.toBase58(),
          }),
        ]);

        // check for the ownership proof flag in the did account
        const didAccount = await service.getDidAccount();
        expect(didAccount?.verificationMethods[1].flags.array).toContain(
          BitwiseVerificationMethodFlag.OwnershipProof
        );
      },
      testTimeout
    );

    it(
      "should add multiple verification methods with ownership proof",
      async () => {
        // airdrop to the login wallet
        await airdrop(connection, loginKeypair.publicKey);

        // add first key
        let transaction = await addVerificationMethodWithOwnershipProof({
          didIDToModify: loginDid.toString(),
          didOwnerWalletPublicKey: loginKeypair.publicKey.toBase58(),
          linkedWalletPublicKey: keypairToAdd.publicKey.toBase58(),
          didDocument: undefined, // let the function retreive the DID document
          keyAlias: undefined, // do not specify the alias
          connection,
        });
        await sendAndConfirmTransaction(connection, transaction, [
          loginKeypair,
          keypairToAdd,
        ]);

        // add second key
        const secondKeyPairToAdd = Keypair.generate();
        transaction = await addVerificationMethodWithOwnershipProof({
          didIDToModify: loginDid.toString(),
          didOwnerWalletPublicKey: loginKeypair.publicKey.toBase58(),
          linkedWalletPublicKey: secondKeyPairToAdd.publicKey.toBase58(),
          connection,
        });
        await sendAndConfirmTransaction(connection, transaction, [
          loginKeypair,
          secondKeyPairToAdd,
        ]);

        // resolve did document
        const service = DidSolService.build(loginDid, { connection });
        const didDocument = await service.resolve();
        expect(didDocument.verificationMethod).toHaveLength(3);
        expect(didDocument.verificationMethod).toEqual([
          expect.objectContaining({
            id: `${loginDid}#default`,
            publicKeyBase58: loginKeypair.publicKey.toBase58(),
          }),
          expect.objectContaining({
            // by default the fragment is the public key shortened
            id: `${loginDid}#${getShortenedPublicKey(
              keypairToAdd.publicKey.toBase58()
            ).replace(/[^A-Z0-9]/gi, "")}`,
            publicKeyBase58: keypairToAdd.publicKey.toBase58(),
          }),
          expect.objectContaining({
            // by default the fragment is the public key shortened
            id: `${loginDid}#${getShortenedPublicKey(
              secondKeyPairToAdd.publicKey.toBase58()
            ).replace(/[^A-Z0-9]/gi, "")}`,
            publicKeyBase58: secondKeyPairToAdd.publicKey.toBase58(),
          }),
        ]);
      },
      testTimeout
    );

    it(
      "should fail if attempt to add a key with fragment that already exists",
      async () => {
        const shouldFail = addVerificationMethodWithOwnershipProof({
          didIDToModify: loginDid.toString(),
          didOwnerWalletPublicKey: loginKeypair.publicKey.toBase58(),
          linkedWalletPublicKey: keypairToAdd.publicKey.toBase58(),
          didDocument: undefined, // let the function retreive the DID document
          keyAlias: "default", // this fragment already exists
          connection,
        });
        expect(shouldFail).rejects.toThrowError(
          "The specified fragment already exists in DID document"
        );
      },
      testTimeout
    );
  });

  describe("removeVerificationMethod tests", () => {
    it(
      "should remove a verification method from the did given the public-key",
      async () => {
        // airdrop to the login wallet
        await airdrop(connection, loginKeypair.publicKey);

        // build the transaction to add the key
        let transaction = await addVerificationMethodWithOwnershipProof({
          didIDToModify: loginDid.toString(),
          didOwnerWalletPublicKey: loginKeypair.publicKey.toBase58(),
          linkedWalletPublicKey: keypairToAdd.publicKey.toBase58(),
          didDocument: undefined, // let the function retreive the DID document
          keyAlias: "newkey",
          connection,
        });

        await sendAndConfirmTransaction(connection, transaction, [
          loginKeypair,
          keypairToAdd,
        ]);

        // resolve did document
        let service = DidSolService.build(loginDid, { connection });
        let didDocument = await service.resolve();
        expect(didDocument.verificationMethod).toHaveLength(2);

        // build the transaction to add the key
        transaction = await removeVerificationMethod({
          didIDToModify: loginDid.toString(),
          didOwnerWalletPublicKey: loginKeypair.publicKey.toBase58(),
          linkedWalletPublicKey: keypairToAdd.publicKey.toBase58(),
          connection,
        });
        await sendAndConfirmTransaction(connection, transaction, [
          loginKeypair,
        ]);

        // resolve did document
        service = DidSolService.build(loginDid, { connection });
        didDocument = await service.resolve();
        expect(didDocument.verificationMethod).toHaveLength(1);
      },
      testTimeout
    );

    it(
      "should fail if attempt to remove a key not found in the did",
      async () => {
        const shouldFail = removeVerificationMethod({
          didIDToModify: loginDid.toString(),
          didOwnerWalletPublicKey: loginKeypair.publicKey.toBase58(),
          linkedWalletPublicKey: Keypair.generate().publicKey.toBase58(),
          connection,
        });
        expect(shouldFail).rejects.toThrowError(
          "The specified key is not found in DID document"
        );
      },
      testTimeout
    );
  });

  describe("addToDidRegistry", () => {
    it(
      "should add the DID to the registry",
      async () => {
        const controllingKey = Keypair.generate();
        const keypair1 = Keypair.generate();

        await airdrop(connection, controllingKey.publicKey);
        await airdrop(connection, keypair1.publicKey);

        const did = DidSolIdentifier.create(
          keypair1.publicKey,
          localnetCluster
        );

        const wallet = {
          publicKey: controllingKey.publicKey,
        } as Wallet;

        const addIx1 = (
          await addVerificationMethodWithOwnershipProof({
            didIDToModify: did.toString(),
            didOwnerWalletPublicKey: keypair1.publicKey.toBase58(),
            linkedWalletPublicKey: wallet.publicKey.toBase58(),
            connection,
          })
        ).instructions;

        const registerIx = await addToDidRegistry(
          controllingKey.publicKey.toBase58(),
          did.toString(),
          connection,
          did.authority.toBase58(),
          localnetCluster
        );

        const transaction = new Transaction();

        transaction.add(...addIx1, ...registerIx);

        await sendAndConfirmTransaction(connection, transaction, [
          keypair1,
          controllingKey,
        ]);

        const registry = Registry.for(wallet, connection, localnetCluster);
        const dids = await registry.listDIDs();

        expect(dids.includes(did.toString())).toBeTruthy();
      },
      testTimeout
    );
  });

  describe("removeDidFromRegistry", () => {
    it(
      "should remove the DID from the registry",
      async () => {
        const controllingKey = Keypair.generate();
        const keypair1 = Keypair.generate();

        await airdrop(connection, controllingKey.publicKey);
        await airdrop(connection, keypair1.publicKey);

        const did = DidSolIdentifier.create(
          keypair1.publicKey,
          localnetCluster
        );

        const wallet = {
          publicKey: controllingKey.publicKey,
        } as Wallet;

        const addIx1 = (
          await addVerificationMethodWithOwnershipProof({
            didIDToModify: did.toString(),
            didOwnerWalletPublicKey: keypair1.publicKey.toBase58(),
            linkedWalletPublicKey: wallet.publicKey.toBase58(),
            connection,
          })
        ).instructions;

        const registerIx = await addToDidRegistry(
          controllingKey.publicKey.toBase58(),
          did.toString(),
          connection,
          keypair1.publicKey.toBase58(),
          localnetCluster
        );

        const addTx = new Transaction();

        addTx.add(...addIx1, ...registerIx);

        await sendAndConfirmTransaction(connection, addTx, [
          keypair1,
          controllingKey,
        ]);

        const removeIx = await removeDidFromRegistry(
          controllingKey.publicKey.toBase58(),
          did.toString(),
          connection,
          keypair1.publicKey.toBase58(),
          localnetCluster
        );

        const removeTx = new Transaction();
        removeTx.add(...removeIx);
        await sendAndConfirmTransaction(connection, removeTx, [controllingKey]);

        const registry = Registry.for(wallet, connection, localnetCluster);
        const dids = await registry.listDIDs();

        expect(dids.includes(did.toString())).toBeFalsy();
      },
      testTimeout
    );
  });
});
