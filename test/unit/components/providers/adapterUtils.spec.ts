import { allowWalletChange } from "../../../../src/components/providers/adapterUtils";
import { WalletAdapterInterface } from "../../../../src/types";

describe("adapter utils", () => {
  describe("allowWalletChange", () => {
    describe("with an existing wallet with a public key", () => {
      it("should return false", () => {
        const result = allowWalletChange(
          { publicKey: "existing" } as WalletAdapterInterface<string>,
          { publicKey: "selected" } as WalletAdapterInterface<string>
        );
        expect(result).toEqual(false);
      });
    });

    describe("with an existing wallet with no public key", () => {
      it("should return true", () => {
        const result = allowWalletChange(
          {} as WalletAdapterInterface<string>,
          { publicKey: "selected" } as WalletAdapterInterface<string>
        );
        expect(result).toEqual(true);
      });
    });

    describe("with a selected wallet that is disconnecting", () => {
      it("should return true", () => {
        const result = allowWalletChange(
          {} as WalletAdapterInterface<string>,
          {
            publicKey: "selected",
            disconnecting: true,
          } as WalletAdapterInterface<string>
        );
        expect(result).toEqual(true);
      });
    });

    describe("with a selected wallet that has no public key", () => {
      it("should return true", () => {
        const result = allowWalletChange(
          {} as WalletAdapterInterface<string>,
          {} as WalletAdapterInterface<string>
        );
        expect(result).toEqual(true);
      });
    });
  });
});
