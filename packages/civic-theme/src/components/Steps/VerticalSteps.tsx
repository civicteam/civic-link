/* eslint-disable no-nested-ternary */
/* This example requires Tailwind CSS v2.0+ */
import { CheckIcon } from "@heroicons/react/20/solid";
import React, { PropsWithChildren } from "react";
import { Step } from "../../types";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type OwnProps = {
  steps: Step[];
  withNumbers?: boolean;
};

export function VerticalSteps({
  steps,
  withNumbers = false,
}: PropsWithChildren<OwnProps>): React.ReactElement {
  return (
    <nav aria-label="Progress">
      <ol className={`${withNumbers ? "vertical-steps-with-numbers" : ""}`}>
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pb-10" : "",
              "relative",
              "focus:outline-none",
              step.status === "complete" ? "active" : ""
            )}
          >
            {step.status === "complete" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-secondary"
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex items-start focus:outline-none"
                  onClick={() => step.onStepClick && step.onStepClick()}
                >
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                      <CheckIcon
                        className="h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-4 mt-2 flex min-w-0 flex-col align-middle">
                    <span
                      className="text-sm font-medium text-secondary"
                      // we need to use this in case we want HTML markup in our description
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: step.name }}
                    />
                  </span>
                </a>
              </>
            ) : step.status === "current" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-secondary"
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex items-start focus:outline-none"
                  aria-current="step"
                >
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-secondary bg-white" />
                  </span>
                  <span className="ml-4 mt-1 flex min-w-0 flex-col">
                    <span
                      className="font-bold text-secondary"
                      // we need to use this in case we want HTML markup in our description
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: step.name }}
                    />
                    {step.description && (
                      <span
                        className="mt-4"
                        // we need to use this in case we want HTML markup in our description
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: step.description }}
                      />
                    )}
                  </span>
                </a>
                {step.content && (
                  <div className="container pl-12" key={`${step.name}_content`}>
                    {step.content}
                  </div>
                )}
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex items-start focus:outline-none"
                >
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                    </span>
                  </span>
                  <span className="ml-4 mt-2 flex min-w-0 flex-col">
                    <span
                      className="text-sm font-medium text-gray-500"
                      // we need to use this in case we want HTML markup in our description
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: step.name }}
                    />
                  </span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

VerticalSteps.defaultProps = {
  withNumbers: false,
};
