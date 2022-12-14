export function getShortenedPublicKey(address: string | undefined): string {
  if (address) {
    return `${address.substring(0, 4)}...${address.substring(
      address.length - 4
    )}`;
  }
  return "";
}
