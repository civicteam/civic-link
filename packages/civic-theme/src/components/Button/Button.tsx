/* eslint-disable react/jsx-props-no-spreading */
import React, { PropsWithChildren } from "react";
import Spinner from "../Loading/Spinner";
import StyledButton, {
  ButtonVariant,
  StyledRoundedButton,
} from "./StyledButton";

export interface ButtonProps {
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
  variant?: ButtonVariant;
  loading?: boolean;
  onClick?: () => void;
  thin?: boolean;
  tabIndex?: number;
}

const yPaddingVariants = (variant: ButtonVariant) => {
  switch (variant) {
    case "medium": {
      return "py-1";
    }
    case "big": {
      return "py-2";
    }
    default: {
      return "";
    }
  }
};

function Loading(variant?: ButtonVariant) {
  return (
    <div
      className={`flex flex-row items-center ${
        variant ? yPaddingVariants(variant) : ""
      } !px-8 text-textInactive`}
    >
      <Spinner />
    </div>
  );
}

export function RoundedButton({
  type = "button",
  disabled,
  variant,
  loading,
  onClick,
  thin,
  children,
  tabIndex,
}: PropsWithChildren<ButtonProps>): React.ReactElement {
  return (
    <StyledRoundedButton
      type={type}
      disabled={disabled || loading}
      variant={variant}
      onClick={onClick}
      thin={thin}
      isLoading={loading}
      tabIndex={tabIndex}
    >
      {loading ? Loading(variant) : children}
    </StyledRoundedButton>
  );
}
RoundedButton.defaultProps = { type: "button", onClick: undefined };

export default function Button({
  type,
  disabled,
  variant,
  loading,
  onClick,
  thin,
  children,
  tabIndex,
}: PropsWithChildren<ButtonProps>): React.ReactElement {
  return (
    <StyledButton
      type={type}
      disabled={disabled}
      variant={variant}
      onClick={onClick}
      thin={thin}
      isLoading={loading}
      tabIndex={tabIndex}
    >
      {loading ? Loading() : children}
    </StyledButton>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const WrappedButton = React.forwardRef((props, _ref) => {
  return <RoundedButton {...props} variant="secondary-outline" />;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const WrappedButtonRound = React.forwardRef((props, _ref) => {
  return <RoundedButton {...props} variant="tertiary-outline-round" />;
});

Button.defaultProps = {
  type: "button",
  disabled: false,
  thin: false,
  variant: "",
  loading: false,
  onClick: null,
  tabIndex: undefined,
};

RoundedButton.defaultProps = Button.defaultProps;
