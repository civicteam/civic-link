import { PublicKey } from "@solana/web3.js";
import Web3Utils from "web3-utils";
import { LinkWalletInputParameters } from "../types";

function isSolanaAddress(address: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

const isEthereumAddress = (address: string): boolean => {
  if (!address || address.length < 42) return false;
  return Web3Utils.checkAddressChecksum(address);
};

const isValidAddress = (address: string): boolean => {
  const sanitizedAddress = address?.trim();
  return (
    isSolanaAddress(sanitizedAddress) || isEthereumAddress(sanitizedAddress)
  );
};

export const validateLinkWalletInput = (
  linkWalletInputParameters: LinkWalletInputParameters
): boolean => {
  if (!isValidAddress(linkWalletInputParameters.existingAuthorityPublicKey)) {
    return false;
  }
  if (
    linkWalletInputParameters.walletToLinkPublicKey &&
    !isValidAddress(linkWalletInputParameters.walletToLinkPublicKey)
  ) {
    return false;
  }
  return true;
};
