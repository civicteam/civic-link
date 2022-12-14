import "../css/index.css";

import React, {
  ReactChild,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export enum Themes {
  MAIN = "main-theme",
  BLUE = "blue-theme",
}

interface ThemeContextInterface {
  theme: Themes | null;
  changeTheme: (theme: Themes) => void;
}

export const ThemeContext = React.createContext<ThemeContextInterface>(
  {} as ThemeContextInterface
);

export default function ThemeProvider({
  children,
}: {
  children: ReactChild;
}): ReactElement {
  const [theme, setTheme] = useState<Themes | null>(null);

  // change class on the document component to the selected theme
  const changeTheme = useCallback(
    (selectedTheme: Themes) => {
      const root = document.documentElement;
      if (theme) root.classList.remove(theme);
      root.classList.add(selectedTheme);
      setTheme(selectedTheme);
    },
    [theme, setTheme]
  );

  // change the theme with the default theme once the app is started
  useEffect(() => {
    changeTheme(Themes.MAIN);

    // disabling exaustive-deps since we just need to run it on the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context = useMemo(() => ({ theme, changeTheme }), [theme, changeTheme]);

  return (
    <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>
  );
}
