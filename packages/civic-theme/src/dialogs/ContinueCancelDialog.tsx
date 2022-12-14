/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { RoundedButton, StyledRoundedCenteredButton } from "../components";
import BaseDialog from "./BaseDialog";

export type ContinueCancelDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  continueButtonLabel?: string;
  cancelButtonLabel?: string;
  onContinueClicked: () => void;
  onClose: () => void;
};

/**
 * Presents the user with a list of choices, each with a title, subtitle and icon.
 */
function ContinueCancelDialog({
  isOpen,
  onContinueClicked,
  onClose,
  title,
  description,
  continueButtonLabel,
  cancelButtonLabel,
}: ContinueCancelDialogProps): React.ReactElement {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="max-w-md"
      withPadding={false}
    >
      <div className="py-1">
        <div className="relative w-full flex-auto pb-0">
          <h4 className="my-2 mx-auto mt-12 text-center text-xl font-extrabold leading-7 text-secondary">
            {title}
          </h4>
        </div>
        <div className="mx-5 mb-4 text-center font-light">{description}</div>
        <div className="mb-5">
          <div />
          <div className="mt-6 flex flex-col items-center justify-center gap-y-6">
            <StyledRoundedCenteredButton
              disabled={false}
              type="button"
              className="!px-6"
              onClick={onContinueClicked}
            >
              <span className="text-lg">{continueButtonLabel}</span>
            </StyledRoundedCenteredButton>
            <RoundedButton
              type="button"
              variant="secondary-outline-text"
              onClick={onClose}
            >
              {cancelButtonLabel}
            </RoundedButton>
          </div>
          <div />
        </div>
      </div>
    </BaseDialog>
  );
}

ContinueCancelDialog.defaultProps = {
  continueButtonLabel: "Continue",
  cancelButtonLabel: "Cancel",
};

export default ContinueCancelDialog;
