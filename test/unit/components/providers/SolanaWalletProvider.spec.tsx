import { PublicKey } from "@solana/web3.js";
import { render, screen, act } from "@testing-library/react";
import React, { useContext } from "react";
import { Adapter, WalletAdapter } from "@solana/wallet-adapter-base";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletAdapterInterface } from "../../../../src/types";

describe("<SolanaWalletProvider />", () => {
  let walletAdapter: WalletAdapterInterface<PublicKey>;

  const lowLevelWallet = jest.mocked({
    ready: true,
    disconnecting: false,
    autoConnect: false,
    wallet: null as WalletAdapter | null,
    wallets: [] as WalletAdapter[],
    adapter: null as Adapter | null,
    publicKey: new PublicKey("BdnZRVycP4Hh3SB87jtusoQ6FQQ1XetUh68WWjaA8bxr"),
    visible: true,
    signTransaction: async () => "transaction",
    signAllTransactions: async () => "transactions",
  }) as unknown as jest.Mocked<WalletContextState>;

  beforeEach(() => {
    jest.doMock("@solana/wallet-adapter-react", () => ({
      ...jest.requireActual("@solana/wallet-adapter-react"),
      useWallet: jest.fn().mockReturnValue(lowLevelWallet),
    }));
    jest.doMock("@solana/wallet-adapter-react-ui", () => ({
      WalletMultiButton: jest
        .fn()
        .mockReturnValue(<div>WalletMultiButton</div>),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shoud build the provider with a walletMultiButton component and set the walletAdapter", async () => {
    const { SolanaWalletProvider, SolanaWalletContext } = await import(
      "../../../../src/components/providers"
    );

    function TestComponent(): React.ReactElement {
      walletAdapter = useContext(SolanaWalletContext);
      return <div />;
    }

    const resolvedDid = "did:sol:localnet:123";
    const didResolver = () => Promise.resolve(resolvedDid);

    await act(async () => {
      render(
        <SolanaWalletProvider didResolver={didResolver}>
          <TestComponent />
        </SolanaWalletProvider>
      );
    });

    expect(walletAdapter).toBeDefined();
    expect(walletAdapter.did).toEqual(resolvedDid);
    expect(screen.getByText(/^WalletMultiButton/)).toBeTruthy();
  });
});
