import { PropsWithChildren, useMemo } from "react";

import { CssBaseline, ThemeProvider } from "@mui/material";

import { getTheme } from "~/config/theme";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import { GlobalThemeContext } from ".";

export default function GlobalThemeProvider(props: PropsWithChildren) {
  const rootSlice = useAppSelector(rootSelector);

  const theme = useMemo(
    () =>
      getTheme({
        colors: rootSlice?.appSettings?.colors,
      }),
    [rootSlice?.appSettings?.colors],
  );

  return (
    <GlobalThemeContext.Provider value={{}}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {props.children}
      </ThemeProvider>
    </GlobalThemeContext.Provider>
  );
}
