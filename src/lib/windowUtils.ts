export const clearStorageAndCookies = (): void => {
  localStorage.clear();
  document.cookie.split(";").forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  sessionStorage.clear();
};
