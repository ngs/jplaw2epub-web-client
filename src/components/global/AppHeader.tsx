import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  AppBar,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
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
        <Tooltip title="ヘルプ" placement="bottom" arrow sx={{ ml: "auto" }}>
          <IconButton
            size="small"
            sx={{ ml: "auto", color: "inherit" }}
            LinkComponent={"a"}
            href="/help/"
            target="_blank"
          >
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};
