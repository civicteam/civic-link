import {
  OutgoingEvent,
  CivicPostMessageApi,
  IncomingEventCallback,
  IncomingEvent,
} from "../types";

export const windowEventListener = (
  targetWindowOrigin: string,
  civicLinkUrl?: string,
  targetWindow: Window = window
): CivicPostMessageApi => {
  const callbacks: {
    callback: IncomingEventCallback;
    listenerFunction: (event: MessageEvent) => void;
  }[] = [];
  return {
    postMessage: (event: OutgoingEvent, origin = targetWindowOrigin): void => {
      targetWindow.parent.postMessage(event, origin);
    },

    addEventListener: (callback: IncomingEventCallback): void => {
      const listenerFunction = (event: MessageEvent): void => {
        if (civicLinkUrl && event.origin !== civicLinkUrl) {
          return undefined;
        }
        return callback(event.data as IncomingEvent);
      };
      callbacks.push({ callback, listenerFunction });
      targetWindow.addEventListener("message", listenerFunction);
    },

    removeEventListener: (inCallback: IncomingEventCallback): void => {
      callbacks.map(
        ({ callback, listenerFunction }) =>
          callback === inCallback &&
          targetWindow.removeEventListener("message", listenerFunction)
      );
    },
    removeEventListeners: (): void => {
      callbacks.map(({ listenerFunction }) =>
        targetWindow.removeEventListener("message", listenerFunction)
      );
    },
  };
};
