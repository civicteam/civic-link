import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { WalletAdapterInterface } from "../../types";
import { build } from "./builders/solana";

export const SolanaWalletContext = createContext<
  WalletAdapterInterface<PublicKey>
>({} as WalletAdapterInterface<PublicKey>);

export function useSolanaWallet(): WalletAdapterInterface<PublicKey | string> {
  return useContext(SolanaWalletContext);
}

type OwnProps = {
  didResolver?: (arg: string) => Promise<string>;
};

const logDebugWallet = (message: unknown, wallet: WalletContextState) =>
  // eslint-disable-next-line no-console
  console.log(`[SolanaWalletProvider] ${message}`, {
    connected: wallet.connected,
    connecting: wallet.connecting,
    disconnecting: wallet.disconnecting,
  });
/**
 * SolanaWalletProvider
 * The universal interface (WalletAdapterInterface) follows the WalletContextState
 * closely, so we can get away with spreading props and only extending where needed.
 *
 * @param children
 */
export function SolanaWalletProvider({
  children,
  didResolver,
}: PropsWithChildren<OwnProps>): React.ReactElement {
  const lowLevelWallet = useWallet();

  const buttonRef = React.useRef<HTMLDivElement>(null);

  const [adapter, setAdapter] = useState<WalletAdapterInterface<PublicKey>>(
    {} as WalletAdapterInterface<PublicKey>
  );

  useEffect(() => {
    const controller = new AbortController();
    if (lowLevelWallet) {
      logDebugWallet("useEffect", lowLevelWallet);

      const buildAdapterPromise = async () => {
        const walletAdapter = await build(
          lowLevelWallet,
          () => {
            (buttonRef.current?.children[0] as HTMLButtonElement).click();
          },
          didResolver
        );
        if (controller.signal.aborted) {
          return;
        }
        setAdapter(walletAdapter);
      };
      buildAdapterPromise();
    }
    return () => {
      controller?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    didResolver,
    lowLevelWallet.disconnecting,
    lowLevelWallet.connected,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    lowLevelWallet.publicKey?.toBase58(),
    lowLevelWallet.connecting,
  ]);

  return (
    <SolanaWalletContext.Provider value={adapter}>
      <div ref={buttonRef} style={{ display: "none" }}>
        <WalletMultiButton />
      </div>
      {children}
    </SolanaWalletContext.Provider>
  );
}

SolanaWalletProvider.defaultProps = {
  didResolver: undefined,
};
