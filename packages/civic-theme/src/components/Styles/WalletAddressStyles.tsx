import React, { ReactNode } from "react";
import tw from "twin.macro";

const StyledComponent = tw.section`
  [span.dialog-wallet-address]:(rounded-md text-textPrimary py-0.5 px-1 mx-1 whitespace-nowrap)
  [span.wallet-address-primary]:(bg-success)
  [span.wallet-address-secondary]:(bg-textInactive)
  [span.wallet-address-mismatch]:(bg-textInactive)
`;

type Props = { children: ReactNode | undefined };
export function WalletAddressStyles({
  children = null,
}: Props): React.ReactElement {
  return <StyledComponent>{children}</StyledComponent>;
}
