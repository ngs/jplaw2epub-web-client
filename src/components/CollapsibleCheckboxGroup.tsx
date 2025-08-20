import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  FormGroup,
  IconButton,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import type { FC } from "react";

export interface CheckboxOption {
  value: string;
  label: string;
}

interface CollapsibleCheckboxGroupProps {
  title: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string | null;
  defaultCollapsed?: boolean;
  minSelection?: number;
}

export const CollapsibleCheckboxGroup: FC<CollapsibleCheckboxGroupProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  error,
  defaultCollapsed = false,
  minSelection = 1,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleSelectAll = () => {
    onChange(options.map((opt) => opt.value));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      // Prevent deselecting if it would go below minimum
      if (minSelection > 0 && selectedValues.length <= minSelection) {
        return;
      }
      onChange(selectedValues.filter((v) => v !== value));
    }
  };

  const getSelectedSummary = () => {
    if (selectedValues.length === options.length) {
      return "全て選択中";
    }
    if (selectedValues.length === 0) {
      return "未選択";
    }
    if (selectedValues.length <= 5) {
      return options
        .filter((opt) => selectedValues.includes(opt.value))
        .map((opt) => opt.label)
        .join("、");
    }
    return `${selectedValues.length}件選択中`;
  };

  return (
    <Box sx={{ mb: 3, bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" sx={{ mr: 3 }}>
          {title}
        </Typography>
        <IconButton size="small" onClick={() => setIsCollapsed(!isCollapsed)}>
          {!isCollapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        {isCollapsed && (
          <Typography
            variant="caption"
            sx={{ ml: 1, color: "text.secondary", cursor: "pointer" }}
            onClick={() => setIsCollapsed(false)}
          >
            {getSelectedSummary()}
          </Typography>
        )}
        {!isCollapsed && (
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAll}
              disabled={selectedValues.length === options.length}
            >
              全て選択
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleDeselectAll}
              disabled={selectedValues.length === 0}
            >
              全て解除
            </Button>
          </Box>
        )}
      </Box>
      <Collapse in={!isCollapsed} sx={{ mt: !isCollapsed ? 2 : 0 }}>
        <FormGroup
          row
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(6, 1fr)",
            },
            gap: 1,
          }}
        >
          {options.map((option) => (
            <Fragment key={String(option.value)}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) =>
                      handleCheckboxChange(option.value, e.target.checked)
                    }
                  />
                }
                label={option.label}
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 120,
                  },
                }}
              />
            </Fragment>
          ))}
        </FormGroup>
      </Collapse>
      {error && (
        <Typography
          color="error"
          variant="caption"
          sx={{ mt: 1, display: "block" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};
