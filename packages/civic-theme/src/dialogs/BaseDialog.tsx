import { Dialog, Transition } from "@headlessui/react";
import React, { CSSProperties, Fragment } from "react";

const defaultOnClose = () => ({});
export default function BaseDialog({
  isOpen,
  onClose,
  title,
  contentClassName,
  withPadding,
  children,
  withOverlay = true,
}: {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  contentClassName?: string;
  withPadding?: boolean;
  children: React.ReactChild;
  withOverlay?: boolean;
}): React.ReactElement | null {
  const extraStyles: CSSProperties = {
    backdropFilter: "blur(2rem)",
    borderRadius: "32px",
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" onClose={onClose || defaultOnClose}>
        {withOverlay && (
          <div className="fixed inset-0 z-[101] bg-gray-900/60" />
        )}
        <Dialog.Panel className="h-screen w-screen items-center justify-center overflow-y-auto overflow-x-hidden align-middle outline-none focus:outline-none">
          {title && <Dialog.Title>Payment successful</Dialog.Title>}
          <div
            className={`absolute top-1/2 left-1/2 z-[102] mx-auto -translate-x-1/2 -translate-y-1/2 transform p-4 md:h-auto ${contentClassName} w-full`}
          >
            <div
              style={extraStyles}
              className={`shadow-[rgba(19, 21, 30, 0.65)] flex-col border-0 bg-white shadow-2xl outline-none focus:outline-none ${
                withPadding ? "p-16" : ""
              } text-primary`}
            >
              {onClose !== defaultOnClose && (
                <button
                  type="button"
                  className="absolute top-6 right-6 mr-1 mt-1 ml-auto inline-flex cursor-pointer items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 sm:top-3 sm:right-2.5"
                  onClick={onClose}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <div>{children}</div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
}

BaseDialog.defaultProps = {
  contentClassName: "",
  title: undefined,
  withPadding: true,
  withOverlay: true,
  onClose: defaultOnClose,
};
