import React, { PropsWithChildren } from "react";
import { StepStatus } from "../../types";
import { RoundedButton } from "../Button";

export type StepProps = {
  isContinueEnabled?: () => boolean;
  showContinue?: boolean;
  onCancel?: () => unknown;
  setStepComplete: <T>(result?: T) => unknown;
  status: StepStatus;
};

export function StepWrapper({
  isContinueEnabled,
  showContinue,
  setStepComplete,
  status,
  onCancel,
  children,
}: PropsWithChildren<StepProps>): React.ReactElement {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {status === StepStatus.current && (
        <div>
          <div className="my-4">{children}</div>
          <div className="mt-6 flex justify-end space-x-2 self-center text-lg">
            {onCancel && (
              <RoundedButton
                onClick={onCancel}
                variant="secondary-outline"
                type="button"
                disabled={!!onCancel}
              >
                Cancel
              </RoundedButton>
            )}

            {showContinue && isContinueEnabled && setStepComplete && (
              <RoundedButton
                onClick={setStepComplete}
                type="button"
                disabled={!isContinueEnabled()}
              >
                Continue
              </RoundedButton>
            )}
          </div>
        </div>
      )}
    </>
  );
}

StepWrapper.defaultProps = {
  showContinue: true,
  isContinueEnabled: undefined,
  onCancel: undefined,
};
