import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { LawType } from "../gql/graphql";

export interface SearchFormData {
  keyword?: string;
  lawTitle?: string;
  lawTitleKana?: string;
  lawNum?: string;
  lawType?: LawType[];
  asof?: string;
  promulgateDateFrom?: string;
  promulgateDateTo?: string;
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  initialValues?: SearchFormData;
  loading?: boolean;
}

const lawTypeLabels: Record<LawType, string> = {
  CONSTITUTION: "憲法",
  ACT: "法律",
  CABINET_ORDER: "政令",
  IMPERIAL_ORDER: "勅令",
  MINISTERIAL_ORDINANCE: "府省令",
  RULE: "規則",
  MISC: "その他",
};

const lawTypeValues: LawType[] = [
  "CONSTITUTION",
  "ACT",
  "CABINET_ORDER",
  "IMPERIAL_ORDER",
  "MINISTERIAL_ORDINANCE",
  "RULE",
  "MISC",
];

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  initialValues = {},
  loading = false,
}) => {
  const { control, handleSubmit, watch } = useForm<SearchFormData>({
    defaultValues: initialValues,
  });

  const searchMode = watch("keyword") ? "keyword" : "law";

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSearch)}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Controller
              name="keyword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="キーワード検索"
                  placeholder="検索したいキーワードを入力"
                  variant="outlined"
                  helperText="キーワードを入力すると、法令本文を全文検索します"
                />
              )}
            />
          </Grid>

          {searchMode === "law" && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="lawTitle"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="法令名"
                      placeholder="例: 民法"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="lawTitleKana"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="法令名（カナ）"
                      placeholder="例: みんぽう"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="lawNum"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="法令番号"
                      placeholder="例: 平成29年法律第44号"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="lawType"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>法令種別</InputLabel>
                  <Select
                    {...field}
                    multiple
                    input={<OutlinedInput label="法令種別" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as LawType[]).map((value) => (
                          <Chip
                            key={value}
                            label={lawTypeLabels[value]}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    onChange={(e) => {
                      field.onChange(e.target.value as LawType[]);
                    }}
                  >
                    {lawTypeValues.map((value) => (
                      <MenuItem key={value} value={value}>
                        {lawTypeLabels[value]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="asof"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="基準日"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  helperText="指定日時点で有効な法令を検索"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="promulgateDateFrom"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="公布日（開始）"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="promulgateDateTo"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="公布日（終了）"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              {loading ? "検索中..." : "検索"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
