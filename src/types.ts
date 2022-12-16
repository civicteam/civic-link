import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Web3Provider } from "@ethersproject/providers";

export interface CivicPostMessageApi {
  postMessage: (event: OutgoingEvent, origin?: string) => void;
  addEventListener: (callback: IncomingEventCallback) => void;
  removeEventListener: (callback: IncomingEventCallback) => void;
  removeEventListeners: () => void;
}

export interface EventEmitter {
  postMessage: (message: unknown, targetOrigin: string) => void;
}

export interface IncomingEvent extends Event {
  eventType: LinkEventType;
  data?: LinkWalletEventPayload;
}

export type IncomingEventWrapper = MessageEvent<IncomingEvent>;
export interface IncomingEventCallback extends EventListener {
  (incomingEvent: IncomingEventWrapper): void;
}

export type OutgoingEvent = {
  eventType: LinkEventType;
  data?: LinkWalletEventPayload;
};

export enum LinkEventType {
  ANALYTICS = "ANALYTICS",
  WALLET_CONNECTED = "WALLET_CONNECTED",
  ADD_WALLET_TO_DID_WITH_VERIFICATION = "ADD_WALLET_TO_DID_WITH_VERIFICATION",
  VERIFY_WITH_OWNERSHIP_SUCCESS = "VERIFY_WITH_OWNERSHIP_SUCCESS",
}

export type LinkLocalWalletPayload = {
  publicKey: string;
};

export type AddWalletToDidPayload = {
  serializedTransaction: string;
  inputParameters: LinkWalletInputParameters;
};

export type AddWalletToDidSuccessPayload = {
  inputParameters: LinkWalletInputParameters;
  linkededWalletPublicKey: string;
};

export enum AnalyticsEventCategory {
  MakePublicWithOwnership = "MakePublicWithOwnership",
}

export enum AnalyticsEventAction {
  WalletToLinkClickedConnect = "Clicked on wallet to link connect",
  WalletToLinkWalletConnected = "Wallet to link connected",
  WalletToLinkDisconnected = "Wallet to link disconnected",
  LoginWalletClickedConnect = "Clicked on login wallet connect",
  LoginWalletConnected = "Login Wallet connected",
  LoginWalletDisconnected = "Login Wallet disconnected",
  StepComplete = "Step complete",
}
export type AnalyticsPayload = {
  category: AnalyticsEventCategory;
  action: AnalyticsEventAction;
  name?: string;
};

export type LinkWalletEventPayload = Partial<LinkLocalWalletPayload> &
  Partial<AddWalletToDidPayload> &
  Partial<AnalyticsPayload> &
  Partial<AddWalletToDidSuccessPayload>;

export enum ChainType {
  ETHEREUM = "ethereum",
  SOLANA = "solana",
}

export type WalletAdapterInterface<T> = {
  name?: string;
  walletType?: ChainType | null;
  publicKey?: string | null;
  did?: string;
  nativePublicKey?: T | null;
  library?: Web3Provider | null;
  connecting: boolean;
  connected: boolean;
  disconnecting: boolean;

  ready(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>;
};

export type MultiWalletConnectionInterface = {
  wallet: WalletAdapterInterface<PublicKey | string>;
  setWallet(wallet: WalletAdapterInterface<PublicKey | string>): void;
  selectChain(): void;
  validateSelectedWallet: () => Promise<boolean>;
  selectedProviderWallet: WalletAdapterInterface<PublicKey | string>;
};

export enum WalletChainType {
  SOLANA = "solana",
  ETHEREUM = "ethereum",
}

export enum FlowType {
  LOCAL = "local",
  VERIFY_WITH_OWNERSHIP = "verify-with-ownership",
}

export type LinkWalletInputParameters = {
  existingAuthorityPublicKey: string;
  existingAuthorityDid: string;
  flow: FlowType;
  walletToLinkPublicKey?: string;
  chain?: WalletChainType;
  chainNetwork?: string;
  rpcEndpoint?: string;
  origin?: string;
};

export enum WalletType {
  Primary = "primary",
  Remote = "remote", // on user DID
  Local = "local", // linked locally
  CryptidDefault = "cryptid_default", // user's default Cryptid account
  Vault = "vault", // Cryptid wallet used for vaulting
}
