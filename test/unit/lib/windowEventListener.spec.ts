import { LinkEventType, OutgoingEvent } from "../../../src/types";
import { windowEventListener } from "../../../src/lib";

const civicLinkUrl = "http://localhost";
describe("windowEventListener", () => {
  describe("postMessage", () => {
    const testPostMessage: OutgoingEvent = {
      eventType: LinkEventType.WALLET_CONNECTED,
      data: { publicKey: "test_publicKey" },
    };

    it("should post the message to targetWindow parent", () => {
      const postMessageSpy = jest.fn();
      const dummyWindow = {
        parent: { postMessage: postMessageSpy },
      } as unknown as Window;
      const eventListener = windowEventListener(
        "test",
        civicLinkUrl,
        dummyWindow
      );
      eventListener.postMessage(testPostMessage, "test");
      expect(postMessageSpy).toHaveBeenCalledWith(testPostMessage, "test");
    });
  });

  describe("addEventListener", () => {
    it("should add event listener to the targetWindow", () => {
      const addEventListenerSpy = jest.fn();
      const dummyWindow = {
        addEventListener: addEventListenerSpy,
      } as unknown as Window;
      const eventListener = windowEventListener(
        "test",
        civicLinkUrl,
        dummyWindow
      );
      const testListenerFn = jest.fn();
      eventListener.addEventListener(testListenerFn);
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "message",
        expect.anything()
      );
    });
  });

  describe("removeEventListeners", () => {
    it("should remove an event listener from the targetWindow", () => {
      const addEventListenerSpy = jest.fn();
      const removeEventListenerSpy = jest.fn();
      const dummyWindow = {
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
      } as unknown as Window;
      const eventListener = windowEventListener(
        "test",
        civicLinkUrl,
        dummyWindow
      );
      const testListenerFn = () => "test";
      const testListenerFn2 = () => "test2";
      eventListener.addEventListener(testListenerFn);
      eventListener.addEventListener(testListenerFn2);

      eventListener.removeEventListeners();

      expect(removeEventListenerSpy).toHaveReturnedTimes(2);
    });
  });

  describe("removeEventListener", () => {
    it("should remove a single event listener from the targetWindow", () => {
      const addEventListenerSpy = jest.fn();
      const removeEventListenerSpy = jest.fn();
      const dummyWindow = {
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
      } as unknown as Window;
      const eventListener = windowEventListener(
        "test",
        civicLinkUrl,
        dummyWindow
      );
      const testListenerFn = () => "test";
      const testListenerFn2 = () => "test2";
      eventListener.addEventListener(testListenerFn);
      eventListener.addEventListener(testListenerFn2);

      eventListener.removeEventListener(testListenerFn);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "message",
        expect.anything()
      );
      expect(removeEventListenerSpy).toHaveReturnedTimes(1);
    });
  });
});
