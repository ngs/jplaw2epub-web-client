import React from "react";
import { Link } from "react-router";
import { AppBar, Toolbar, Typography } from "@mui/material";

interface AppHeaderProps {
  onHomeClick: (e: React.MouseEvent) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onHomeClick }) => {
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