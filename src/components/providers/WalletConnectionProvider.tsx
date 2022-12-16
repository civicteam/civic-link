import {
  WalletAdapter,
  WalletAdapterNetwork,
} from "@solana/wallet-adapter-base";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  GlowWalletAdapter,
  BackpackWalletAdapter,
  ExodusWalletAdapter,
  WalletConnectWalletAdapter,
  TorusWalletAdapter,
  BraveWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import React, { PropsWithChildren, ReactElement, useMemo } from "react";
import { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base/src/signer";
import { ChainType, WalletChainType } from "../../types";
import { EthereumWalletProvider } from "./EthereumWalletProvider";
import { SolanaWalletProvider } from "./SolanaWalletProvider";
import { XChainWalletProvider } from "./XChainWalletProvider";

const IS_PROD = (process.env.REACT_APP_STAGE || "prod") === "prod";

const walletConnectProjectId = "82329781ad11d885787f56261bd891ca";
function DefaultWrapper({
  children,
}: {
  children: React.ReactChild;
}): ReactElement {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
type OwnProps = {
  didResolver?: (arg: string) => Promise<string>;
  walletType?: ChainType;
  walletsList?: WalletAdapter[];
  setWalletOnProviderChange?: boolean;
  chains?: WalletChainType[];
  network?: WalletAdapterNetwork;
};
export const defaultWalletsList = (
  network: WalletAdapterNetwork = WalletAdapterNetwork.Mainnet
): MessageSignerWalletAdapter[] => {
  return [
    new BackpackWalletAdapter(),
    new BraveWalletAdapter(),
    new GlowWalletAdapter(),
    new PhantomWalletAdapter(),
    new WalletConnectWalletAdapter({
      options: { projectId: walletConnectProjectId },
      network: network as
        | WalletAdapterNetwork.Mainnet
        | WalletAdapterNetwork.Devnet,
    }),
    new SolflareWalletAdapter(),
    new ExodusWalletAdapter(),
    new TorusWalletAdapter(),
    // Non-prod wallets
    ...(IS_PROD ? [] : [new SolletWalletAdapter({ network })]),
  ];
};

/**
 * WalletConnectionProvider: Bootstraps the underlying wallet providers
 * required by the wallet adapters/translators and injects them into the context.
 *
 * @param children
 */
function WalletConnectionProvider({
  children,
  didResolver,
  walletType = ChainType.SOLANA,
  walletsList,
  setWalletOnProviderChange = false,
  chains = [WalletChainType.SOLANA],
  network,
}: PropsWithChildren<OwnProps>): JSX.Element {
  const wallets = useMemo(() => defaultWalletsList(network), [network]);

  // Checks if we are in test env and injects some demo wallets
  const finalWalletList = walletsList || wallets;

  let EthereumWrapper = DefaultWrapper;
  if (chains.includes(WalletChainType.ETHEREUM)) {
    EthereumWrapper = EthereumWalletProvider;
  }

  return (
    <WalletProvider wallets={finalWalletList} autoConnect>
      <WalletModalProvider>
        <SolanaWalletProvider didResolver={didResolver}>
          <EthereumWrapper>
            <XChainWalletProvider
              setWalletOnProviderChange={setWalletOnProviderChange}
              walletType={walletType}
            >
              {children}
            </XChainWalletProvider>
          </EthereumWrapper>
        </SolanaWalletProvider>
      </WalletModalProvider>
    </WalletProvider>
  );
}
WalletConnectionProvider.defaultProps = {
  didResolver: undefined,
  walletType: ChainType.SOLANA,
  walletsList: undefined,
  setWalletOnProviderChange: false,
  chains: [WalletChainType.SOLANA],
  network: WalletAdapterNetwork.Mainnet,
};
export default WalletConnectionProvider;
