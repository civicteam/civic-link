export enum StepStatus {
  complete = "complete",
  current = "current",
  upcoming = "upcoming",
}
export type Step = {
  name: string;
  description: string;
  href: string;
  status: StepStatus;
  content?: React.ReactChild;
  onStepClick?: () => void;
};
