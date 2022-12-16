import { build } from "../../../src/components/providers/builders/ethereum";

jest.mock("../../../src/components/providers/builders/web3modal", () => ({
  retrieveWeb3Accounts: jest.fn(),
  getWeb3Modal: jest.fn().mockImplementation(() => {
    return {
      cachedProvider: "test",
      connect: jest.fn,
      clearCachedProvider: jest.fn(),
    };
  }),
}));

describe("Ethereum builder constructs valid usable wallets without web3 cache", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });
  test("We can construct a valid wallet with web3Modal null cache provider using the build function.", async () => {
    const evaluationTarget = await build(
      "0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0",
      jest.fn
    );

    expect(evaluationTarget.did).toEqual(
      "did:ethr:0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0"
    );
    expect(evaluationTarget.nativePublicKey).toEqual(
      "0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0"
    );
    expect(evaluationTarget.publicKey).toEqual(
      "0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0"
    );
    expect(evaluationTarget.walletType).toEqual("ethereum");
    expect(evaluationTarget.ready()).resolves.toEqual(true);
    expect(evaluationTarget.connect());
    expect(evaluationTarget.disconnect());
    expect(evaluationTarget.signMessage).toThrowError();
    expect(evaluationTarget.sendTransaction).toThrowError();
    expect(evaluationTarget.signTransaction).toThrowError();
    expect(evaluationTarget.signAllTransactions).toThrowError();
  });
  test("We can construct a valid wallet using the build function.", async () => {
    const evaluationTarget = await build(
      "0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0",
      jest.fn
    );

    expect(evaluationTarget.did).toEqual(
      "did:ethr:0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0"
    );
    expect(evaluationTarget.nativePublicKey).toEqual(
      "0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0"
    );
    expect(evaluationTarget.publicKey).toEqual(
      "0x520daDF6E5E1b4fc55b472E23E9a31BEcb632df0"
    );
    expect(evaluationTarget.walletType).toEqual("ethereum");
    expect(evaluationTarget.ready()).resolves.toEqual(true);
    expect(evaluationTarget.connect());
    expect(evaluationTarget.disconnect());
    expect(evaluationTarget.signMessage).toThrowError();
    expect(evaluationTarget.sendTransaction).toThrowError();
    expect(evaluationTarget.signTransaction).toThrowError();
    expect(evaluationTarget.signAllTransactions).toThrowError();
  });
});
