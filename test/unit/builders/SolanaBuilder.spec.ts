import { Adapter, WalletAdapter } from "@solana/wallet-adapter-base";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { build } from "../../../src/components/providers/builders/solana";

describe("Solana builder constructs valid usable wallets", () => {
  test("We can construct a valid wallet using the build function.", async () => {
    const lowLevelWallet = jest.mocked({
      ready: true,
      disconnecting: false,
      autoConnect: false,
      wallet: null as WalletAdapter | null,
      wallets: [] as WalletAdapter[],
      adapter: null as Adapter | null,
      signTransaction: async () => "transaction",
      signAllTransactions: async () => "transactions",
    }) as unknown as jest.Mocked<WalletContextState>;

    lowLevelWallet.publicKey = new PublicKey(
      "BdnZRVycP4Hh3SB87jtusoQ6FQQ1XetUh68WWjaA8bxr"
    );

    const evaluationTarget = await build(lowLevelWallet, jest.fn, () =>
      Promise.resolve(`did:sol:${lowLevelWallet.publicKey?.toBase58()}`)
    );

    expect(await evaluationTarget.did).toEqual(
      "did:sol:BdnZRVycP4Hh3SB87jtusoQ6FQQ1XetUh68WWjaA8bxr"
    );
    expect(evaluationTarget.nativePublicKey?.toBase58()).toEqual(
      "BdnZRVycP4Hh3SB87jtusoQ6FQQ1XetUh68WWjaA8bxr"
    );
    expect(evaluationTarget.publicKey).toEqual(
      "BdnZRVycP4Hh3SB87jtusoQ6FQQ1XetUh68WWjaA8bxr"
    );

    await expect(
      evaluationTarget.signTransaction({} as unknown as Transaction)
    ).resolves.toBe("transaction");

    await expect(
      evaluationTarget.signAllTransactions({} as unknown as Transaction[])
    ).resolves.toBe("transactions");
  });
});
