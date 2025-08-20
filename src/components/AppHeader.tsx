import { AppBar, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router";
import type { FC, MouseEvent } from "react";

interface AppHeaderProps {
  onHomeClick: (e: MouseEvent) => void;
}

export const AppHeader: FC<AppHeaderProps> = ({ onHomeClick }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          onClick={onHomeClick}
          sx={{
            color: "inherit",
            textDecoration: "none",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          法令検索・EPUB ダウンロード
        </Typography>
      </Toolbar>
    </AppBar>
  );
};