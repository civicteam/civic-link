import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnalyticsPayload,
  CivicPostMessageApi,
  IncomingEvent,
  IncomingEventCallback,
  LinkEventType,
} from "../../types";
import { windowEventListener } from "../../lib/eventListener";

export interface PostMessageContext {
  postMessageApi: CivicPostMessageApi;
  latestAnalyticEvent?: AnalyticsPayload;
}

export const PostMessageContext = createContext<PostMessageContext>(
  {} as PostMessageContext
);

export function useCivicPostMessageApi(): PostMessageContext {
  return useContext(PostMessageContext);
}
type OwnProps = {
  targetWindow: Window | undefined;
  targetWindowOrigin: string;
  listenForAnalytics: boolean;
  civicLinkUrl?: string;
};

export default function PostMessageProvider({
  targetWindow,
  targetWindowOrigin,
  civicLinkUrl,
  listenForAnalytics = false,
  children,
}: PropsWithChildren<OwnProps>): ReactElement {
  const [latestAnalyticEvent, setLatestAnalyticEvent] =
    useState<AnalyticsPayload>();
  const [postMessageApi, setPostMessageApi] = useState<CivicPostMessageApi>(
    windowEventListener(targetWindowOrigin, civicLinkUrl, targetWindow)
  );

  // initialise the postmessage API on load
  useEffect(() => {
    const postMessageApiInst = windowEventListener(
      targetWindowOrigin,
      civicLinkUrl,
      targetWindow
    );
    setPostMessageApi(postMessageApiInst);
    let analyticsCallback: IncomingEventCallback;
    if (listenForAnalytics) {
      // only fire on analytics events
      analyticsCallback = (evt) => {
        const incomingEvent = evt as IncomingEvent;
        if (
          incomingEvent &&
          incomingEvent?.eventType === LinkEventType.ANALYTICS
        ) {
          setLatestAnalyticEvent(incomingEvent.data as AnalyticsPayload);
        }
      };
      postMessageApiInst.addEventListener(analyticsCallback);
    }
    return () => {
      postMessageApiInst.removeEventListener(analyticsCallback);
    };
  }, [targetWindow, targetWindowOrigin, listenForAnalytics, civicLinkUrl]);

  const value = useMemo(
    () => ({
      postMessageApi,
      latestAnalyticEvent,
    }),
    [postMessageApi, latestAnalyticEvent]
  );

  return (
    <PostMessageContext.Provider value={value}>
      {children}
    </PostMessageContext.Provider>
  );
}

PostMessageProvider.defaultProps = {
  civicLinkUrl: undefined,
};
