import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";
import {
  TextField,
  Button,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Collapse,
} from "@mui/material";
import { useEffect, useState, Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  lawCategories,
  categoryOptions,
  eraOptions,
  lawNumTypeOptions,
} from "../constants";
import { convertToKanji } from "../utils/convertToKanji";
import { parseLawNumber, buildLawNumber } from "../utils/lawNumberParser";
import type { LawType, CategoryCode } from "../gql/graphql";
import type { FC } from "react";

export interface SearchFormData {
  keyword?: string;
  lawTitle?: string;
  lawTitleKana?: string;
  lawNum?: string;
  lawType?: LawType[];
  categoryCode?: CategoryCode[];
  asof?: string;
  promulgateDateFrom?: string;
  promulgateDateTo?: string;
}

// Extended type for internal form use
interface InternalFormData extends SearchFormData {
  searchMode: "name" | "keyword" | "number";
  lawTimeMode?: "current" | "point";
  lawNumEra?: string;
  lawNumYear?: string;
  lawNumType?: string;
  lawNumNo?: string;
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  initialValues?: SearchFormData;
  loading?: boolean;
}

export const SearchForm: FC<SearchFormProps> = ({
  onSearch,
  initialValues = {},
  loading = false,
}) => {
  // Parse law number from initial values (keep as kanji)
  const parsedLawNum = parseLawNumber(initialValues?.lawNum);
  const initialLawNumFields = parsedLawNum
    ? {
        lawNumEra: parsedLawNum.era,
        lawNumYear: parsedLawNum.year,
        lawNumType: parsedLawNum.type,
        lawNumNo: parsedLawNum.number,
      }
    : {};

  const { control, handleSubmit, watch, reset, setValue } =
    useForm<InternalFormData>({
      defaultValues: {
        searchMode: initialValues?.keyword
          ? "keyword"
          : initialValues?.lawNum
          ? "number"
          : "name",
        lawTimeMode: initialValues?.asof ? "point" : "current",
        lawType:
          initialValues?.lawType?.length ?? 0 > 0
            ? initialValues.lawType
            : lawCategories.map((cat) => cat.value), // Check all by default
        categoryCode:
          initialValues?.categoryCode?.length ?? 0 > 0
            ? initialValues.categoryCode
            : categoryOptions.map((cat) => cat.value), // Check all by default
        ...initialValues, // Apply initialValues last to override
        ...initialLawNumFields, // Add individual law number fields
      },
    });

  const [showCategories, setShowCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    const defaultValues: SearchFormData = {
      keyword: "",
      lawTitle: "",
      lawTitleKana: "",
      lawNum: "",
      lawType: lawCategories.map((cat) => cat.value), // Check all by default
      categoryCode: categoryOptions.map((cat) => cat.value), // Check all by default
      asof: "",
      promulgateDateFrom: "",
      promulgateDateTo: "",
    };

    // Parse law number into individual fields (keep as kanji)
    const parsedFields = parseLawNumber(initialValues?.lawNum);
    const lawNumFields = parsedFields
      ? {
          lawNumEra: parsedFields.era,
          lawNumYear: parsedFields.year,
          lawNumType: parsedFields.type,
          lawNumNo: parsedFields.number,
        }
      : {};

    reset({
      ...defaultValues,
      ...initialValues,
      ...lawNumFields,
      searchMode: initialValues?.keyword
        ? "keyword"
        : initialValues?.lawNum
        ? "number"
        : "name",
      lawTimeMode: initialValues?.asof ? "point" : "current",
      lawType:
        initialValues?.lawType && initialValues.lawType.length > 0
          ? initialValues.lawType
          : lawCategories.map((cat) => cat.value), // Check all if no initial value
      categoryCode:
        initialValues?.categoryCode && initialValues.categoryCode.length > 0
          ? initialValues.categoryCode
          : categoryOptions.map((cat) => cat.value), // Check all if no initial value
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  const searchMode = watch("searchMode");
  const lawTimeMode = watch("lawTimeMode");
  const selectedLawTypes = watch("lawType") || [];
  const selectedCategories = watch("categoryCode") || [];
  const lawNumEra = watch("lawNumEra");
  const lawNumYear = watch("lawNumYear");
  const lawNumType = watch("lawNumType");
  const lawNumNo = watch("lawNumNo");

  // Build law number
  useEffect(() => {
    if (searchMode === "number") {
      const lawNum = buildLawNumber({
        era: lawNumEra,
        year: lawNumYear,
        type: lawNumType,
        number: lawNumNo,
      });
      if (lawNum) {
        setValue("lawNum", lawNum);
      }
    }
  }, [lawNumEra, lawNumYear, lawNumType, lawNumNo, searchMode, setValue]);

  const handleFormSubmit = (data: InternalFormData) => {
    // Error if no categories are selected
    if (!data.categoryCode || data.categoryCode.length === 0) {
      setCategoryError("最低1つの分類を選択してください");
      return;
    }
    setCategoryError(null);

    // Convert year and number to kanji for law number search
    if (searchMode === "number") {
      if (data.lawNumYear) {
        const kanjiYear = convertToKanji(data.lawNumYear);
        data.lawNumYear = kanjiYear;
        setValue("lawNumYear", kanjiYear); // Update form value too
      }
      if (data.lawNumNo) {
        const kanjiNo = convertToKanji(data.lawNumNo);
        data.lawNumNo = kanjiNo;
        setValue("lawNumNo", kanjiNo); // Update form value too
      }
      // Rebuild law number
      data.lawNum = buildLawNumber({
        era: data.lawNumEra,
        year: data.lawNumYear,
        type: data.lawNumType,
        number: data.lawNumNo,
      });
    }

    const searchData: SearchFormData = {
      keyword: searchMode === "keyword" ? data.keyword : undefined,
      lawTitle: searchMode === "name" ? data.lawTitle : undefined,
      lawNum: searchMode === "number" ? data.lawNum : undefined,
      lawType: data.lawType,
      categoryCode: data.categoryCode,
      asof: data.lawTimeMode === "point" ? data.asof : undefined,
      promulgateDateFrom: data.promulgateDateFrom,
      promulgateDateTo: data.promulgateDateTo,
    };
    onSearch(searchData);
  };

  const handleSelectAllCategories = () => {
    setValue(
      "categoryCode",
      categoryOptions.map((cat) => cat.value)
    );
    setCategoryError(null);
  };

  const handleDeselectAllCategories = () => {
    setValue("categoryCode", []);
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Current law / Point-in-time law section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
            <Controller
              name="lawTimeMode"
              control={control}
              defaultValue="current"
              render={({ field }) => (
                <Select {...field} size="small" sx={{ minWidth: 150 }}>
                  <MenuItem value="current">現行法令</MenuItem>
                  <MenuItem value="point">時点法令</MenuItem>
                </Select>
              )}
            />
            {lawTimeMode === "point" && (
              <Controller
                name="asof"
                control={control}
                render={({ field }) => {
                  // Get today's date (YYYY-MM-DD format)
                  const today = new Date().toISOString().split("T")[0];
                  const minDate = "2017-04-01";

                  return (
                    <TextField
                      {...field}
                      label="時点指定"
                      type="date"
                      size="small"
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: {
                          min: minDate,
                          max: today,
                        },
                      }}
                      sx={{ width: 200 }}
                    />
                  );
                }}
              />
            )}
            <IconButton size="small" sx={{ ml: "auto" }}>
              <HelpOutlineIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search mode selection */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
          <Controller
            name="searchMode"
            control={control}
            defaultValue="name"
            render={({ field }) => (
              <Tabs
                value={field.value}
                onChange={(_, newValue) => field.onChange(newValue)}
                aria-label="検索モード選択"
              >
                <Tab label="法令名" value="name" />
                <Tab label="キーワード" value="keyword" />
                <Tab label="法令番号" value="number" />
              </Tabs>
            )}
          />
        </Box>

        {/* Law types */}
        <Box sx={{ mb: 3, bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="body2" sx={{ mr: 3 }}>
              法令種別
            </Typography>
            <Controller
              name="lawType"
              control={control}
              defaultValue={lawCategories.map((cat) => cat.value)}
              render={({ field }) => (
                <FormGroup row>
                  {lawCategories.map((category) => (
                    <Fragment key={category.value}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            disabled={
                              selectedLawTypes.length === 1 &&
                              selectedLawTypes[0] === category.value
                            }
                            checked={selectedLawTypes.includes(category.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([
                                  ...selectedLawTypes,
                                  category.value,
                                ]);
                              } else {
                                field.onChange(
                                  selectedLawTypes.filter(
                                    (t) => t !== category.value
                                  )
                                );
                              }
                            }}
                          />
                        }
                        label={category.label}
                      />
                    </Fragment>
                  ))}
                </FormGroup>
              )}
            />
          </Box>
        </Box>

        {/* Categories */}
        <Box sx={{ mb: 3, bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" sx={{ mr: 3 }}>
              分類
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowCategories(!showCategories)}
            >
              {showCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            {!showCategories && (
              <Typography
                variant="caption"
                sx={{ ml: 1, color: "text.secondary", cursor: "pointer" }}
                onClick={() => setShowCategories(true)}
              >
                {selectedCategories.length === categoryOptions.length
                  ? "全て選択中"
                  : selectedCategories.length === 0
                  ? "未選択"
                  : selectedCategories.length <= 5
                  ? categoryOptions
                      .filter((opt) => selectedCategories.includes(opt.value))
                      .map((opt) => opt.label)
                      .join("、")
                  : `${selectedCategories.length}件選択中`}
              </Typography>
            )}
            {showCategories && (
              <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectAllCategories}
                  disabled={
                    selectedCategories.length === categoryOptions.length
                  }
                >
                  全て選択
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleDeselectAllCategories}
                  disabled={selectedCategories.length === 0}
                >
                  全て解除
                </Button>
              </Box>
            )}
          </Box>
          <Collapse in={showCategories} sx={{ mt: showCategories ? 2 : 0 }}>
            <Controller
              name="categoryCode"
              control={control}
              defaultValue={categoryOptions.map((cat) => cat.value)}
              render={({ field }) => (
                <>
                  <FormGroup row>
                    {categoryOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={
                          <Checkbox
                            size="small"
                            checked={
                              field.value?.includes(option.value) || false
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([
                                  ...(field.value || []),
                                  option.value,
                                ]);
                                setCategoryError(null);
                              } else {
                                field.onChange(
                                  (field.value || []).filter(
                                    (v) => v !== option.value
                                  )
                                );
                              }
                            }}
                          />
                        }
                        label={option.label}
                        sx={{ minWidth: 120 }}
                      />
                    ))}
                  </FormGroup>
                </>
              )}
            />
          </Collapse>
          {categoryError && (
            <Typography
              color="error"
              variant="caption"
              sx={{ mt: 1, display: "block" }}
            >
              {categoryError}
            </Typography>
          )}
        </Box>

        {/* Search input fields */}
        <Box sx={{ mb: 3 }}>
          {searchMode === "name" && (
            <Controller
              name="lawTitle"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="検索法令名を入力してください。"
                  variant="outlined"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SearchIcon />}
                            disabled={loading}
                          >
                            検索
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          )}

          {searchMode === "keyword" && (
            <Controller
              name="keyword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="検索用語を入力してください。"
                  variant="outlined"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SearchIcon />}
                            disabled={loading}
                          >
                            検索
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          )}

          {searchMode === "number" && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Controller
                name="lawNumEra"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    {...field}
                    displayEmpty
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="">元号</MenuItem>
                    {eraOptions.map((era) => (
                      <MenuItem key={era.value} value={era.value}>
                        {era.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="lawNumYear"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    placeholder="年"
                    sx={{ width: 80 }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const kanjiValue = convertToKanji(value);
                        field.onChange(kanjiValue);
                      }
                      field.onBlur();
                    }}
                  />
                )}
              />
              <Typography>年</Typography>
              <Controller
                name="lawNumType"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    {...field}
                    displayEmpty
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="">種別</MenuItem>
                    {lawNumTypeOptions.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <Typography>第</Typography>
              <Controller
                name="lawNumNo"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    placeholder="号"
                    sx={{ width: 100 }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const kanjiValue = convertToKanji(value);
                        field.onChange(kanjiValue);
                      }
                      field.onBlur();
                    }}
                  />
                )}
              />
              <Typography>号</Typography>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={loading}
                sx={{
                  ml: 2,
                }}
              >
                検索
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
