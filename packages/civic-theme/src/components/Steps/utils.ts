import { Step, StepStatus } from "../../types";

export const setStepComplete = (stepNum: number, steps: Step[]): Step[] =>
  steps.map((step, index) => {
    if (index <= stepNum) {
      return { ...step, status: StepStatus.complete };
    }
    if (index === stepNum + 1) {
      return { ...step, status: StepStatus.current };
    }
    return { ...step, status: StepStatus.upcoming };
  });
