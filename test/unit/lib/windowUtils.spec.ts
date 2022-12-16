import { clearStorageAndCookies } from "../../../src/lib/windowUtils";

describe("windowUtils tests", () => {
  beforeEach(() => {
    jest.spyOn(localStorage, "clear");
    jest.spyOn(sessionStorage, "clear");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should clear local storage", () => {
    clearStorageAndCookies();
    expect(localStorage.clear).toHaveBeenCalled();
  });

  it("should clear session storage", () => {
    clearStorageAndCookies();
    expect(sessionStorage.clear).toHaveBeenCalled();
  });

  it("should clear cookies", () => {
    const cookies = ["cookie1=value1", "cookie2=value2"];
    document.cookie = cookies.join(";");
    clearStorageAndCookies();
    expect(document.cookie).toEqual("");
  });
});
