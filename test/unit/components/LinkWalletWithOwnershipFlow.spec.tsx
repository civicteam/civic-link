/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable func-names */
import React from "react";
import { render, RenderResult, waitFor } from "@testing-library/react";
import { Keypair, Transaction, clusterApiUrl } from "@solana/web3.js";
import type { StepProps } from "@civic/react-commons";
import { StepStatus, getShortenedPublicKey } from "@civic/react-commons";
import { FlowType, WalletChainType } from "../../../src/types";
import LinkWalletWithOwnershipFlow from "../../../src/components/LinkWalletWithOwnershipFlow";

const mockInitialize = jest.fn();
const mockIsOwnershipFlagAlreadyPresent = jest.fn();
const mockEmitStepCompleteAnalytics = jest.fn();
mockInitialize.mockResolvedValue({});
mockIsOwnershipFlagAlreadyPresent.mockReturnValue(true);

const existingAuthorityPublicKey = Keypair.generate().publicKey.toBase58();
const walletToLink = Keypair.generate().publicKey;
const walletToLinkPublicKey = walletToLink.toBase58();
const linkWalletInputParameters = {
  existingAuthorityPublicKey,
  existingAuthorityDid: `did:sol:${existingAuthorityPublicKey}`,
  flow: FlowType.VERIFY_WITH_OWNERSHIP,
  walletToLinkPublicKey,
  chain: WalletChainType.SOLANA,
  chainNetwork: "mainnet-beta",
  rpcEndpoint: clusterApiUrl("devnet"),
  origin: "test_origin",
};

jest.mock("../../../src/lib/linkWalletService", () => {
  const originalModule = jest.requireActual(
    "../../../src/lib/linkWalletService"
  );
  return {
    ...originalModule,
    LinkWalletService: jest.fn().mockImplementation(() => ({
      initialize: mockInitialize,
      isOwnershipFlagAlreadyPresent: mockIsOwnershipFlagAlreadyPresent,
      emitStepCompleteAnalytics: mockEmitStepCompleteAnalytics,
      stepsMetaInfo: [
        {
          name: "Connect wallet to make public",
          description: `Please connect the wallet with the address: <span class="font-semibold">${getShortenedPublicKey(
            linkWalletInputParameters.walletToLinkPublicKey
          )}</span>.`,
          href: "#connectWalletToLink",
          status: StepStatus.current,
        },
        {
          name: "Prove Wallet Ownership",
          description: `Please sign a no-cost transaction to prove you own the wallet.`,
          href: "#proveWalletOwnership",
          status: StepStatus.upcoming,
        },
        {
          name: "Reconnect your primary wallet",
          description: `Please reconnect the wallet you use to log in to Civic.me: <span class="font-semibold">${getShortenedPublicKey(
            linkWalletInputParameters.existingAuthorityPublicKey
          )}</span>.`,
          href: "#reconnectCivicMeWallet",
          status: StepStatus.upcoming,
        },
        {
          name: "Update your Profile",
          description: `Please sign a transaction to update your Civic.me profile.`,
          href: "#updateYourProfile",
          status: StepStatus.upcoming,
        },
      ],
    })),
  };
});

const targetWindow = window; // or mock the targetWindow object

const mockConnectWalletStep = jest.fn();
const callConnectWalletStepComplete = jest.fn();
jest.mock(
  "../../../src/components/LinkWalletWithOwnershipSteps/ConnectWalletStep",
  () =>
    function (props: StepProps) {
      mockConnectWalletStep(props);
      const { setStepComplete } = props;
      if (callConnectWalletStepComplete()) {
        setStepComplete(walletToLinkPublicKey);
      }
      return <div>Mock ProveWalletOwnership</div>;
    }
);

const mockProveWalletOwnership = jest.fn();
const callProveWalletOwnershipComplete = jest.fn();
const mockTransactionInst = new Transaction();
jest.mock(
  "../../../src/components/LinkWalletWithOwnershipSteps/ProveWalletOwnership",
  () =>
    function (props: StepProps) {
      mockProveWalletOwnership(props);
      const { setStepComplete } = props;
      if (callProveWalletOwnershipComplete()) {
        setStepComplete(mockTransactionInst);
      }
      return <div>Mock ProveWalletOwnership</div>;
    }
);

const mockUpdateProfileStep = jest.fn();
const callMockUpdateProfileStep = jest.fn();
const callMockUpdateProfileOnComplete = jest.fn();
jest.mock(
  "../../../src/components/LinkWalletWithOwnershipSteps/UpdateProfile",
  () =>
    function (props: StepProps) {
      mockUpdateProfileStep(props);
      const { setStepComplete } = props;

      if (callMockUpdateProfileStep()) {
        setStepComplete();
      }

      return <div>Mock UpdateProfile</div>;
    }
);

describe("LinkWalletWithOwnershipFlow", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    mockInitialize.mockResolvedValue({});
    mockIsOwnershipFlagAlreadyPresent.mockReturnValue(true);
  });

  it("should show a bad input error message", async () => {
    const { queryByTestId } = render(
      <LinkWalletWithOwnershipFlow
        linkWalletInputParameters={{
          ...linkWalletInputParameters,
          existingAuthorityPublicKey: "bad_key",
        }}
        targetWindow={targetWindow}
      />
    );
    await waitFor(() => {
      expect(queryByTestId("BAD_INPUT_PARAMETERS_DIALOG")).toBeTruthy();
    });
  });

  describe("on initialisation", () => {
    it("should pass the correct initial parameters to ConnectWalletStep", async () => {
      render(
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
        />
      );
      await waitFor(() => {
        expect(mockConnectWalletStep).toHaveBeenCalledWith(
          expect.objectContaining({
            walletToConnectPublicKey:
              linkWalletInputParameters.walletToLinkPublicKey,
            status: StepStatus.current,
          })
        );
      });
    });
  });

  describe("on Connect wallet (step 0) complete", () => {
    beforeEach(() => {
      callConnectWalletStepComplete.mockReturnValue(true);
    });

    it("should emit a StepComplete analytic for step 0", async () => {
      render(
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
        />
      );

      await waitFor(() => {
        expect(mockEmitStepCompleteAnalytics).toHaveBeenCalledWith(0);
      });
    });

    it("should pass the correct initial parameters to ProveWalletOwnership when it gets used", async () => {
      render(
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
        />
      );

      await waitFor(() => {
        expect(mockProveWalletOwnership).toHaveBeenCalledWith(
          expect.objectContaining({
            linkWalletServiceInst: expect.anything(),
            walletToLinkPublicKey,
            status: StepStatus.current,
          })
        );
      });
    });
  });

  describe("on ProveWalletOwnership (step 2) complete", () => {
    beforeEach(() => {
      callConnectWalletStepComplete.mockReturnValue(true);
      callProveWalletOwnershipComplete.mockReturnValue(true);
    });

    it("should emit a StepComplete analytic for step 1", async () => {
      render(
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
        />
      );
      await waitFor(() => {
        expect(mockEmitStepCompleteAnalytics).toHaveBeenCalledWith(1);
      });
    });

    it("should pass the correct initial parameters to the second ConnectWallet step when it gets used", async () => {
      render(
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
        />
      );

      await waitFor(() => {
        expect(mockConnectWalletStep).toHaveBeenCalledWith(
          expect.objectContaining({
            walletToConnectPublicKey:
              linkWalletInputParameters.existingAuthorityPublicKey,
            status: StepStatus.current,
          })
        );
      });
    });
  });

  describe("on connect primary wallet (step 3) complete", () => {
    beforeEach(() => {
      callConnectWalletStepComplete.mockReturnValue(true);
      callProveWalletOwnershipComplete.mockReturnValue(true);
    });

    it("should emit a StepComplete analytic for step 2", async () => {
      render(
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
        />
      );

      await waitFor(() => {
        expect(mockEmitStepCompleteAnalytics).toHaveBeenCalledWith(2);
      });
    });

    it("should pass the correct initial parameters to the UpdateProfile step when it gets used", async () => {
      render(
        <LinkWalletWithOwnershipFlow
          linkWalletInputParameters={linkWalletInputParameters}
          targetWindow={targetWindow}
        />
      );

      await waitFor(() => {
        expect(mockUpdateProfileStep).toHaveBeenCalledWith(
          expect.objectContaining({
            linkWalletServiceInst: expect.anything(),
            linkWalletSignedTransaction: expect.any(Transaction),
            status: StepStatus.current,
          })
        );
      });
    });
  });
});
