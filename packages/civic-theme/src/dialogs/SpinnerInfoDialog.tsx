/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { RoundedButton } from "../components";
import Spinner from "../components/Loading/Spinner";
import BaseDialog from "./BaseDialog";

export type SpinnerInfoDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  closeButtonLabel?: string;
  onClose: () => void;
};

/**
 * Shows a message with a 'busy' spinner below it.
 */
function SpinnerInfoDialog({
  isOpen,
  closeButtonLabel,
  onClose,
  title,
  description,
}: SpinnerInfoDialogProps): React.ReactElement {
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
        <div className="inline-block flex w-full justify-center">
          <Spinner />
        </div>
        <div className="mb-5">
          <div />
          <div className="mt-6 flex flex-col items-center justify-center gap-y-6">
            <RoundedButton
              type="button"
              variant="secondary-outline-text"
              onClick={onClose}
            >
              {closeButtonLabel}
            </RoundedButton>
          </div>
          <div />
        </div>
      </div>
    </BaseDialog>
  );
}

SpinnerInfoDialog.defaultProps = {
  closeButtonLabel: "Close",
};

export default SpinnerInfoDialog;
