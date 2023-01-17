import React from "react";
import { CivicLogo } from "@civic/react-commons";

interface Props {
  children: JSX.Element[] | JSX.Element;
  contentClassName?: string;
}
export const BaseStepper = ({
  children,
  contentClassName,
}: Props): React.ReactElement => {
  return (
    <div className="h-screen w-screen items-center justify-center overflow-y-auto overflow-x-hidden bg-background align-middle outline-none focus:outline-none">
      <div
        className={`absolute top-1/2 left-1/2 z-[102] mx-auto -translate-x-1/2 -translate-y-1/2 transform overflow-hidden p-4 md:h-auto ${
          contentClassName || ""
        } border-radius civic-verification-attribute mx-2 box-border w-full rounded-2xl border border-secondary bg-base`}
      >
        <div className="flex items-start gap-x-2 p-6">
          <div className="mt-2">
            <CivicLogo />
          </div>

          <div className="flex-1">
            <h3 className="font-monument font-extrabold text-secondary">
              LINK WALLET
            </h3>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
BaseStepper.defaultProps = { contentClassName: undefined };
