import { render, waitFor, act } from "@testing-library/react";
import React, { useContext } from "react";
import {
  PostMessageContext,
  PostMessageProvider,
} from "../../../../src/components/providers";
import {
  AnalyticsEventAction,
  AnalyticsEventCategory,
  AnalyticsPayload,
  CivicPostMessageApi,
  IncomingEventCallback,
  IncomingEventWrapper,
  LinkEventType,
  OutgoingEvent,
} from "../../../../src/types";

let postMessageApi: CivicPostMessageApi;
let latestAnalyticEvent: AnalyticsPayload;

function getById<T extends Element>(
  container: HTMLElement,
  id: string,
  expectedValue?: string | null
) {
  const element = container.querySelector<T>(`#${id}`);
  if (!expectedValue) {
    return expect(element).toBeFalsy();
  }
  return expect(element?.textContent).toEqual(expectedValue);
}

const latestAnalyticsEventCategoryId = "latestAnalyticsEventCategory";

function TestComponent(): React.ReactElement {
  const context = useContext(PostMessageContext);
  postMessageApi = context.postMessageApi;
  latestAnalyticEvent = context.latestAnalyticEvent as AnalyticsPayload;
  // render the latestAvanalyticEvent if available
  return latestAnalyticEvent?.category ? (
    <div id={latestAnalyticsEventCategoryId}>
      {latestAnalyticEvent.category}
    </div>
  ) : (
    <div />
  );
}

const testPostMessage: OutgoingEvent = {
  eventType: LinkEventType.WALLET_CONNECTED,
};

const testAnalyticsPostMessage: OutgoingEvent = {
  eventType: LinkEventType.ANALYTICS,
  data: {
    category: AnalyticsEventCategory.MakePublicWithOwnership,
    action: AnalyticsEventAction.StepComplete,
  },
};

describe("<PostMessageProvider />", () => {
  let postMessageSpy: jest.SpyInstance;
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
  let dummyWindow: Window;

  beforeEach(() => {
    // mock window methods
    postMessageSpy = jest.fn();
    addEventListenerSpy = jest.fn();
    removeEventListenerSpy = jest.fn();
    dummyWindow = {
      parent: { postMessage: postMessageSpy },
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
    } as unknown as Window;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * iframe posts
   *
   *
   */
  test("should instantiate a postMessageApi for the provided target window", async () => {
    render(
      <PostMessageProvider
        targetWindow={dummyWindow}
        targetWindowOrigin="http://localhost"
        civicLinkUrl="http://civicLinkUrl"
        listenForAnalytics={false}
      >
        <TestComponent />
      </PostMessageProvider>
    );

    await act(async () => {
      await postMessageApi.postMessage(testPostMessage);
      expect(postMessageSpy).toHaveBeenCalledWith(
        testPostMessage,
        "http://localhost"
      );
    });
  });

  test("should add event listener for analytics events if listenForAnalytics is true", async () => {
    render(
      <PostMessageProvider
        targetWindow={dummyWindow}
        targetWindowOrigin="http://localhost"
        civicLinkUrl="http://civicLinkUrl"
        listenForAnalytics
      >
        <TestComponent />
      </PostMessageProvider>
    );
    expect(addEventListenerSpy).toHaveBeenCalled();
  });

  test("should NOT add an event listener for analytics events if listenForAnalytics is false", async () => {
    render(
      <PostMessageProvider
        targetWindow={dummyWindow}
        targetWindowOrigin="http://localhost"
        civicLinkUrl="http://civicLinkUrl"
        listenForAnalytics={false}
      >
        <TestComponent />
      </PostMessageProvider>
    );
    expect(addEventListenerSpy).toHaveBeenCalledTimes(0);
  });

  describe("when listenForAnalytics is set to true", () => {
    describe("when the event origin matches the civicLinkUrl", () => {
      test("should set set the latest analytic events", async () => {
        const civicLinkUrl = "http://civicLinkUrl";
        // add mock implementation of addEventListener and postMessage to simulate the
        // callbacks being fired
        const listeners: IncomingEventCallback[] = [];
        addEventListenerSpy.mockImplementation((msg, callback) => {
          listeners.push(callback);
        });
        postMessageSpy.mockImplementation((message) => {
          listeners.forEach((listener) =>
            listener({
              data: message,
              origin: civicLinkUrl,
            } as unknown as IncomingEventWrapper)
          );
        });

        const { container } = render(
          <PostMessageProvider
            targetWindow={dummyWindow}
            targetWindowOrigin="http://localhost"
            civicLinkUrl={civicLinkUrl}
            listenForAnalytics
          >
            <TestComponent />
          </PostMessageProvider>
        );

        await act(async () => {
          await postMessageApi.postMessage(testAnalyticsPostMessage);
          await waitFor(() => {
            expect(
              getById(
                container,
                latestAnalyticsEventCategoryId,
                testAnalyticsPostMessage.data?.category
              )
            );
          });
        });
      });
    });

    describe("when the event is from a different non-civic origin", () => {
      test("should not set set the latest analytic events", async () => {
        // add mock implementation of addEventListener and postMessage to simulate the
        // callbacks being fired
        const listeners: IncomingEventCallback[] = [];
        addEventListenerSpy.mockImplementation((msg, callback) => {
          listeners.push(callback);
        });
        postMessageSpy.mockImplementation((message) => {
          listeners.forEach((listener) =>
            listener({
              data: message,
              origin: "phantom",
            } as unknown as IncomingEventWrapper)
          );
        });

        const { container } = render(
          <PostMessageProvider
            targetWindow={dummyWindow}
            targetWindowOrigin="http://localhost"
            civicLinkUrl="http://civicLinkUrl"
            listenForAnalytics
          >
            <TestComponent />
          </PostMessageProvider>
        );
        await act(async () => {
          await postMessageApi.postMessage(testAnalyticsPostMessage);
          await waitFor(() => {
            expect(getById(container, latestAnalyticsEventCategoryId, null));
          });
        });
      });
    });
  });
});
