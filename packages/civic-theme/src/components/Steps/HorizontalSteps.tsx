/* eslint-disable no-nested-ternary */
import { CheckIcon } from "@heroicons/react/20/solid";
import React, { PropsWithChildren } from "react";
import { Step } from "../../types";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
type OwnProps = {
  steps: Step[];
};

export function HorizontalSteps({
  steps,
}: PropsWithChildren<OwnProps>): React.ReactElement {
  return (
    <>
      <nav aria-label="Progress" className="mx-auto flex pb-4">
        <ol className="mx-auto flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className={classNames(
                stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
                "relative"
              )}
            >
              {step.status === "complete" ? (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-secondary" />
                  </div>
                  <a
                    href={step.href}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-opacity-70"
                  >
                    <CheckIcon
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              ) : step.status === "current" ? (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <a
                    href={step.href}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-secondary bg-white"
                    aria-current="step"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-secondary"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <a
                    href={step.href}
                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-opacity-70"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {steps.map((step) => (
        <div className="container" key={`${step.name}_content`}>
          {step.status === "current" && step.content && (
            <>
              <span className="mt-2 flex items-center justify-center font-bold text-secondary">
                {step.name}
              </span>
              <p
                className="flex items-center justify-center text-lg font-normal"
                // we need to use this in case we want HTML markup in our description
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: step.description }}
              />
              <div className="mt-4 flex items-center justify-center font-normal">
                {step.content}
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
}
