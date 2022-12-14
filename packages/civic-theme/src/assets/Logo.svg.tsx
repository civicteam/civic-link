/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from "react";
import FullLogo from "./img/full-logo-beta.svg";
import FullLogoThin from "./img/full-logo-beta-thin.svg";

export default function ({ thin = false }): React.ReactElement {
  const UseLogo = thin ? FullLogoThin : FullLogo;
  return <img src={UseLogo} alt="logo" className="mr-4 h-10" />;
}
