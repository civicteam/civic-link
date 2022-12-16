/* eslint-disable no-console */
import { getShortenedPublicKey } from "@civic/react-commons";
import {
  BitwiseVerificationMethodFlag,
  DidSolDataAccount,
  DidSolDocument,
  DidSolIdentifier,
  DidSolService,
  ExtendedCluster,
  VerificationMethodType,
} from "@identity.com/sol-did-client";
import { DIDDocument } from "did-resolver";
import * as R from "ramda";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Registry, ReadOnlyRegistry } from "@civic/did-registry";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export const getDefaultFragment = (publicKey: string): string => {
  const shortenKey = getShortenedPublicKey(publicKey);
  // remove special chars from the shortened public key
  return shortenKey.replace(/[^A-Z0-9]/gi, "");
};

const parseFragment = (didId: string): string =>
  DidSolIdentifier.parse(didId)?.fragment || "";

const getVMFragments = (didDocument: DidSolDocument): string[] => {
  return didDocument.verificationMethod
    ? didDocument.verificationMethod.map((vm) => parseFragment(vm.id))
    : [];
};

type ModificationParams = {
  fragment: string;
  didAuthority: PublicKey;
  linkingWalletAuthority: PublicKey;
  service: DidSolService;
  didDocument: DIDDocument;
  fragments: string[];
};

/**
 * Look up the DID for the given link wallet key and return the parsed fragment, if it exists
 * @param {string} linkedWalletPublicKey
 * @param {DIDDocument} didDocument
 * @returns {string | undefined}
 */
export const getLinkedWalletFragment = (
  linkedWalletPublicKey: string,
  didDocument: DIDDocument
): string | undefined => {
  const verificationMethods = didDocument?.verificationMethod || [];
  const linkWalletDidID = verificationMethods.find(
    (item) => item?.publicKeyBase58 === linkedWalletPublicKey
  )?.id;
  if (!linkWalletDidID) {
    return undefined;
  }
  return parseFragment(linkWalletDidID);
};

const getUpdateParamsFromInput = async (
  inputParams: DidModificationParams
): Promise<ModificationParams> => {
  const didAuthority = new PublicKey(inputParams.didOwnerWalletPublicKey);
  const linkingWalletAuthority = new PublicKey(
    inputParams.linkedWalletPublicKey
  );
  const serviceOptions = inputParams.connection
    ? { connection: inputParams.connection }
    : {};
  const service = DidSolService.build(
    DidSolIdentifier.parse(inputParams.didIDToModify),
    serviceOptions
  );
  let { didDocument } = inputParams;
  if (!didDocument) {
    didDocument = await service.resolve();
  }
  const verificationMethods = didDocument?.verificationMethod || [];
  const linkWalletDidID = verificationMethods.find(
    (item) => item?.publicKeyBase58 === inputParams.linkedWalletPublicKey
  )?.id;

  const fragment =
    inputParams.keyAlias ||
    (linkWalletDidID && parseFragment(linkWalletDidID)) ||
    getDefaultFragment(linkingWalletAuthority.toBase58());

  const fragments = getVMFragments(didDocument as DidSolDocument);
  return {
    fragment,
    didAuthority,
    linkingWalletAuthority,
    service,
    didDocument,
    fragments,
  };
};
/**
 * Check if the public key associated with a fragment already exists on a verificationMethod on the didDocument
 * @param {string} fragment
 * @param {DidSolDocument} didDocument
 * @returns {boolean}
 */
export const isFragmentAlreadyAddedToDid = (
  fragment: string,
  didDocument: DidSolDocument
): boolean => getVMFragments(didDocument as DidSolDocument).includes(fragment);

export type DidModificationParams = {
  didIDToModify: string;
  didOwnerWalletPublicKey: string;
  linkedWalletPublicKey: string;
  didDocument?: DIDDocument;
  keyAlias?: string;
  connection?: Connection;
};

/**
 * Return a transaction to add a verification method with ownership proof
 * to DID document. It's assumed that the returning transaction will be
 * signed by both the linked and the login wallets.
 * @param {DidModificationParams} inputParams
 * @param {string} inputParams.didIDToModify: string;
 * @param {string} inputParams.didOwnerWalletPublicKey: string;
 * @param {string} inputParams.linkedWalletPublicKey: string;
 * @param {DIDDocument} inputParams.didDocument?: DIDDocument;
 * @param {string} inputParams.keyAlias?: string;
 * @param {Connection} inputParams.connection?: Connection;
 * @returns Promise<Transaction> the transaction to add a verification method
 */
export const addVerificationMethodWithOwnershipProof = async (
  inputParams: DidModificationParams
): Promise<Transaction> => {
  const {
    service,
    fragment,
    linkingWalletAuthority,
    didAuthority,
    didDocument,
  } = await getUpdateParamsFromInput(inputParams);

  const fragmentExists = isFragmentAlreadyAddedToDid(
    fragment,
    didDocument as DidSolDocument
  );

  if (fragmentExists) {
    throw new Error("The specified fragment already exists in DID document");
  }
  return (
    service
      // need to be signed by the existing authority
      .addVerificationMethod(
        {
          fragment,
          keyData: linkingWalletAuthority.toBytes(),
          methodType: VerificationMethodType.Ed25519VerificationKey2018,
          flags: [BitwiseVerificationMethodFlag.CapabilityInvocation],
        },
        didAuthority
      )
      // need to be signed by the ledger key
      .setVerificationMethodFlags(
        fragment,
        [
          BitwiseVerificationMethodFlag.CapabilityInvocation,
          BitwiseVerificationMethodFlag.OwnershipProof,
        ],
        linkingWalletAuthority
      )
      .withAutomaticAlloc(didAuthority, didAuthority)
      .transaction()
  );
};

/**
 * Update an existing verificaiton method, adding the provided flags
 * @param {DidModificationParams} inputParams
 * @param {string} inputParams.didIDToModify
 * @param {string} inputParams.didOwnerWalletPublicKey
 * @param {string} inputParams.linkedWalletPublicKey
 * @param {DIDDocument} inputParams.didDocument
 * @param {string} inputParams.keyAlias
 * @param {Connection} inputParams.connection?
 * @param {BitwiseVerificationMethodFlag[]} inputParams.flags
 * @returns Promise<Transaction> the transaction to add a verification method
 */
export const addFlagsToVerificationMethod = async (
  inputParams: DidModificationParams & {
    flags: BitwiseVerificationMethodFlag[];
  }
): Promise<Transaction> => {
  const { service, fragment, linkingWalletAuthority, didAuthority } =
    await getUpdateParamsFromInput(inputParams);

  return (
    service
      // need to be signed by the ledger key
      .setVerificationMethodFlags(
        fragment,
        inputParams.flags,
        linkingWalletAuthority
      )
      .withAutomaticAlloc(didAuthority, didAuthority)
      .transaction()
  );
};

/**
 * Return a transaction to remove a verification method from the DID document
 * given the (to be removed) verification method public key.
 * @param {DidModificationParams} inputParams
 * @param {string} inputParams.didIDToModify: string;
 * @param {string} inputParams.didOwnerWalletPublicKey: string;
 * @param {string} inputParams.linkedWalletPublicKey: string;
 * @returns Promise<Transaction> the transaction to add a verification method
 */
export const removeVerificationMethod = async (
  inputParams: DidModificationParams
): Promise<Transaction> => {
  const { fragment, fragments, service, didAuthority } =
    await getUpdateParamsFromInput(inputParams);
  if (!fragment || !fragments.includes(fragment)) {
    throw new Error("The specified key is not found in DID document");
  }

  return (
    service
      // need to be signed by the owner
      .removeVerificationMethod(fragment, didAuthority)
      .withAutomaticAlloc(didAuthority, didAuthority)
      .transaction()
  );
};

/**
 * check the provided did data account (if it exists) for verification methods containing the provided public key, then check if the verification method
 * has the requested flag
 *
 * @param {string} publicKey
 * @param {BitwiseVerificationMethodFlag} flag
 * @param {DidSolDataAccount} didSolDataAccount
 * @returns {boolean}
 */
export const isVerificationMethodFlagPresent = (
  publicKey: string,
  flag: BitwiseVerificationMethodFlag,
  didSolDataAccount: DidSolDataAccount | null
): boolean => {
  const keyToCheckVerificationMethod =
    didSolDataAccount?.verificationMethods?.find((vm) =>
      R.equals(vm.keyData, new PublicKey(publicKey).toBytes())
    );
  if (!keyToCheckVerificationMethod) {
    return false;
  }

  if (keyToCheckVerificationMethod.flags.array.includes(flag)) {
    return true;
  }
  return false;
};

/** Return true if the DID is in the registry
 * @param registryKey
 * @param did
 * @param connection
 * @param cluster
 * @param existingRegistry
 * @returns Promise<boolean> true if the DID is in the registry
 */
export const isDidRegistered = async (
  registryKey: string,
  did: string,
  connection: Connection,
  cluster?: ExtendedCluster,
  existingRegistry?: ReadOnlyRegistry
): Promise<boolean> => {
  const registry =
    existingRegistry ??
    ReadOnlyRegistry.for(new PublicKey(registryKey), connection, cluster);

  const dids = await registry.listDIDs();
  return dids.includes(did);
};

/**
 * Return the instruction to register a DID in the registry
 * @param {string} registryKey
 * @param {string} didToAdd
 * @param {Connection} connection
 * @param {string} payer
 * @param {ExtendedCluster} cluster
 * @returns {Promise<TransactionInstruction[]>} the instructions to register a DID
 */
export const addToDidRegistry = async (
  registryKey: string,
  didToAdd: string,
  connection: Connection,
  payer: string,
  cluster?: ExtendedCluster
): Promise<TransactionInstruction[]> => {
  const registryPublicKey = new PublicKey(registryKey);
  const registry = Registry.for(
    { publicKey: registryPublicKey } as AnchorWallet,
    connection,
    cluster,
    new PublicKey(payer)
  );

  const isRegistered = await isDidRegistered(
    registryKey,
    didToAdd,
    connection,
    cluster,
    registry
  );

  if (!isRegistered) {
    const { instructions } = await (
      await registry.register(didToAdd)
    ).transaction();

    return instructions;
  }

  throw new Error("DID already exists in the registry");
};

/**
 * Return the instruction to remove a DID from the registry
 * @param registryKey
 * @param didToRemove
 * @param connection
 * @param cluster
 * @returns Promise<TransactionInstruction[]> the instructions to remove a DID
 */
export const removeDidFromRegistry = async (
  registryKey: string,
  didToRemove: string,
  connection: Connection,
  payer: string,
  cluster?: ExtendedCluster
): Promise<TransactionInstruction[]> => {
  const registryPublicKey = new PublicKey(registryKey);
  const registry = Registry.for(
    {
      publicKey: registryPublicKey,
    } as AnchorWallet,
    connection,
    cluster,
    new PublicKey(payer)
  );

  const isRegistered = await isDidRegistered(
    registryKey,
    didToRemove,
    connection,
    cluster,
    registry
  );

  if (isRegistered) {
    const { instructions } = await registry.remove(didToRemove).transaction();
    registry.close();
    return instructions;
  }

  registry.close();
  throw new Error("DID not found in registry");
};
