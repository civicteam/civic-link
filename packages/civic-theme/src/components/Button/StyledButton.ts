import tw, { styled } from "twin.macro";

export type ButtonVariant =
  | "big"
  | "medium"
  | "primary"
  | "primary-outline"
  | "secondary-outline"
  | "secondary-outline-text"
  | "secondary-white-text"
  | "secondary-white-background"
  | "tertiary"
  | "tertiary-outline-text"
  | "tertiary-outline-round"
  | "quaternary"
  | "delete"
  | "success";

interface ButtonProps {
  variant?: ButtonVariant;
  disabled: boolean | undefined;
  thin?: boolean | undefined;
  isLoading?: boolean | undefined;
}

const StyledButton = styled.button(
  ({ variant, disabled, thin, isLoading }: ButtonProps) => [
    // Default base layout for all buttons
    tw`font-light px-4 rounded-full relative flex items-center justify-between
    [svg,img]:(h-5 w-5)`,
    thin &&
      tw`h-8
      [svg,img]:(h-4 w-4)`,
    !thin && tw`py-2.5`,
    // Default when no variant set
    !variant && tw`bg-secondary text-base hover:bg-textQuaternary`,
    disabled &&
      tw`bg-opacity-80 hover:bg-secondary hover:bg-opacity-80 text-base text-opacity-80`,
    isLoading &&
      tw`bg-secondary text-base hover:bg-secondary hover:bg-opacity-100`,
    // Secondary colour big
    variant === "big" &&
      tw`font-light px-4 rounded-full relative flex items-center justify-between
      bg-secondary text-base hover:bg-textQuaternary px-12 py-4
      [svg,img]:(h-5 w-5)`,
    variant === "big" &&
      disabled &&
      tw`bg-opacity-80 hover:bg-secondary hover:bg-opacity-80 text-base text-opacity-80`,
    variant === "big" &&
      isLoading &&
      tw`bg-secondary text-base hover:bg-secondary hover:bg-opacity-100`,
    variant === "medium" &&
      tw`font-light !px-8 rounded-full relative flex items-center justify-between
      bg-secondary text-base hover:bg-textQuaternary
      [svg,img]:(h-5 w-5)`,
    variant === "medium" &&
      disabled &&
      tw`bg-opacity-80 hover:bg-secondary hover:bg-opacity-80 text-base text-opacity-80`,
    variant === "medium" &&
      isLoading &&
      tw`bg-secondary text-base hover:bg-secondary hover:bg-opacity-100`,
    // Primary colour inverted
    variant === "primary-outline" &&
      tw`bg-base hover:bg-primary hover:bg-opacity-10 border border-primary text-primary`,
    variant === "primary-outline" &&
      disabled &&
      tw`bg-inactive bg-opacity-60 hover:bg-inactive hover:bg-opacity-60 text-opacity-70`,
    variant === "primary-outline" &&
      isLoading &&
      tw`bg-base hover:bg-base hover:bg-opacity-100`,
    // Secondary colour inverted
    variant === "secondary-outline" &&
      tw`bg-base hover:bg-secondary hover:bg-opacity-10 border border-secondary text-secondary`,
    variant === "secondary-outline" &&
      disabled &&
      tw`bg-inactive bg-opacity-60 hover:bg-inactive hover:bg-opacity-60 text-opacity-80`,
    variant === "secondary-outline" &&
      isLoading &&
      tw`bg-base hover:bg-base hover:bg-opacity-100`,
    // Secondary colour inverted no border
    variant === "secondary-outline-text" &&
      tw`bg-transparent hover:bg-secondary hover:bg-opacity-10 border-secondary text-secondary`,
    variant === "secondary-outline-text" &&
      disabled &&
      tw`bg-transparent bg-opacity-60 hover:bg-transparent hover:bg-opacity-60 text-opacity-60`,
    variant === "secondary-outline-text" &&
      isLoading &&
      tw`bg-transparent hover:bg-transparent hover:bg-opacity-100`,
    // Primary colour
    variant === "primary" &&
      tw`bg-primary hover:bg-primary hover:bg-opacity-70 border-borderPrimary text-base`,
    variant === "primary" &&
      disabled &&
      tw`bg-opacity-80 hover:bg-primary hover:bg-opacity-80 text-base text-opacity-80`,
    variant === "primary" &&
      isLoading &&
      tw`bg-primary text-base hover:bg-primary hover:bg-opacity-100`,

    // Others
    variant === "secondary-white-text" &&
      tw`bg-secondary hover:bg-secondary bg-opacity-70 border-secondary text-white`,
    variant === "secondary-white-background" &&
      tw`bg-white border-secondary text-secondary hover:bg-secondary hover:bg-opacity-10`,
    variant === "tertiary-outline-text" &&
      tw`bg-transparent hover:bg-secondary hover:bg-opacity-10 border border-tertiary text-secondary`,
    variant === "tertiary" &&
      tw`bg-tertiary hover:bg-tertiary hover:bg-opacity-80 text-textTertiary`,
    variant === "tertiary-outline-round" &&
      tw`rounded-full h-12 w-12 p-0 m-0 justify-center bg-white hover:bg-secondary hover:bg-opacity-10 border border-tertiary text-primary
    [svg,img]:(h-5 w-5 mr-0)`,
    variant === "quaternary" &&
      tw`bg-quaternary hover:bg-quaternary hover:bg-opacity-70 border-borderQuaternary text-textQuaternary`,
    variant === "delete" &&
      tw`bg-delete hover:bg-delete hover:bg-opacity-70 border-borderDelete text-textDelete `,
    variant === "success" &&
      tw`bg-background hover:bg-background hover:bg-opacity-70 border-success text-success `,
  ]
);

export const StyledRoundedButton = tw(StyledButton)`rounded`;

export const StyledRoundedCenteredButton = tw(StyledButton)`rounded mx-auto`;

export default StyledButton;
