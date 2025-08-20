import { createTheme } from "@mui/material";
import { colors } from "./constants/colors";

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
    },
    secondary: {
      main: colors.secondary.main,
    },
    info: {
      main: colors.info.main,
    },
    success: {
      main: colors.success.main,
    },
    warning: {
      main: colors.warning.main,
    },
  },
});
