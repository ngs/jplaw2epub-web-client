import React, { useEffect, useState, Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  lawCategories,
  categoryOptions,
  eraOptions,
  lawNumTypeOptions,
} from "../constants";
import { convertToKanji } from "../utils/convertToKanji";

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
  Collapse,
  IconButton,
  Tabs,
  Tab,
  Link,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import type { LawType, CategoryCode } from "../gql/graphql";

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

// フォーム内部で使用する拡張型
interface InternalFormData extends SearchFormData {
  searchMode: "name" | "keyword" | "number";
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

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  initialValues = {},
  loading = false,
}) => {
  // 法令番号を初期値からパース（漢数字のまま保持）
  let initialLawNumFields = {};
  if (initialValues?.lawNum) {
    const match = initialValues.lawNum.match(
      /^(令和|平成|昭和|大正|明治)([一二三四五六七八九十百千万億兆零\d]+)年(.+?)第([一二三四五六七八九十百千万億兆零\d]+)号$/
    );
    if (match) {
      initialLawNumFields = {
        lawNumEra: match[1],
        lawNumYear: match[2], // 漢数字のまま保持
        lawNumType: match[3],
        lawNumNo: match[4], // 漢数字のまま保持
      };
    }
  }

  const { control, handleSubmit, watch, reset, setValue } =
    useForm<InternalFormData>({
      defaultValues: {
        searchMode: initialValues?.keyword
          ? "keyword"
          : initialValues?.lawNum
          ? "number"
          : "name",
        lawType:
          initialValues?.lawType?.length ?? 0 > 0
            ? initialValues.lawType
            : lawCategories.map((cat) => cat.value), // デフォルトで全てチェック
        categoryCode:
          initialValues?.categoryCode?.length ?? 0 > 0
            ? initialValues.categoryCode
            : categoryOptions.map((cat) => cat.value), // デフォルトで全てチェック
        ...initialValues, // initialValuesを最後に適用して上書き
        ...initialLawNumFields, // 法令番号の個別フィールドを追加
      },
    });

  const [showCurrentLaw, setShowCurrentLaw] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    const defaultValues: SearchFormData = {
      keyword: "",
      lawTitle: "",
      lawTitleKana: "",
      lawNum: "",
      lawType: lawCategories.map((cat) => cat.value), // デフォルトで全てチェック
      categoryCode: categoryOptions.map((cat) => cat.value), // デフォルトで全てチェック
      asof: "",
      promulgateDateFrom: "",
      promulgateDateTo: "",
    };

    // 法令番号をパースして個別フィールドに分解（漢数字のまま保持）
    let lawNumFields = {};
    if (initialValues?.lawNum) {
      const match = initialValues.lawNum.match(
        /^(令和|平成|昭和|大正|明治)([一二三四五六七八九十百千万億兆零\d]+)年(.+?)第([一二三四五六七八九十百千万億兆零\d]+)号$/
      );
      if (match) {
        lawNumFields = {
          lawNumEra: match[1],
          lawNumYear: match[2], // 漢数字のまま保持
          lawNumType: match[3],
          lawNumNo: match[4], // 漢数字のまま保持
        };
      }
    }

    reset({
      ...defaultValues,
      ...initialValues,
      ...lawNumFields,
      searchMode: initialValues?.keyword
        ? "keyword"
        : initialValues?.lawNum
        ? "number"
        : "name",
      lawType:
        initialValues?.lawType && initialValues.lawType.length > 0
          ? initialValues.lawType
          : lawCategories.map((cat) => cat.value), // 初期値がない場合は全てチェック
      categoryCode:
        initialValues?.categoryCode && initialValues.categoryCode.length > 0
          ? initialValues.categoryCode
          : categoryOptions.map((cat) => cat.value), // 初期値がない場合は全てチェック
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  const searchMode = watch("searchMode");
  const selectedLawTypes = watch("lawType") || [];
  const selectedCategories = watch("categoryCode") || [];
  const lawNumEra = watch("lawNumEra");
  const lawNumYear = watch("lawNumYear");
  const lawNumType = watch("lawNumType");
  const lawNumNo = watch("lawNumNo");

  // 法令番号を組み立てる
  useEffect(() => {
    if (
      searchMode === "number" &&
      lawNumEra &&
      lawNumYear &&
      lawNumType &&
      lawNumNo
    ) {
      // 値は既に漢数字になっているのでそのまま使用
      const lawNum = `${lawNumEra}${lawNumYear}年${lawNumType}第${lawNumNo}号`;
      setValue("lawNum", lawNum);
    }
  }, [lawNumEra, lawNumYear, lawNumType, lawNumNo, searchMode, setValue]);

  const handleFormSubmit = (data: InternalFormData) => {
    // カテゴリが1つも選択されていない場合はエラー
    if (!data.categoryCode || data.categoryCode.length === 0) {
      setCategoryError("最低1つの分類を選択してください");
      return;
    }
    setCategoryError(null);

    // 法令番号検索の場合、年と号を漢数字に変換
    if (searchMode === "number") {
      if (data.lawNumYear) {
        const kanjiYear = convertToKanji(data.lawNumYear);
        data.lawNumYear = kanjiYear;
        setValue("lawNumYear", kanjiYear); // フォームの値も更新
      }
      if (data.lawNumNo) {
        const kanjiNo = convertToKanji(data.lawNumNo);
        data.lawNumNo = kanjiNo;
        setValue("lawNumNo", kanjiNo); // フォームの値も更新
      }
      // 法令番号を再構築
      if (
        data.lawNumEra &&
        data.lawNumYear &&
        data.lawNumType &&
        data.lawNumNo
      ) {
        data.lawNum = `${data.lawNumEra}${data.lawNumYear}年${data.lawNumType}第${data.lawNumNo}号`;
      }
    }

    const searchData: SearchFormData = {
      keyword: searchMode === "keyword" ? data.keyword : undefined,
      lawTitle: searchMode === "name" ? data.lawTitle : undefined,
      lawNum: searchMode === "number" ? data.lawNum : undefined,
      lawType: data.lawType,
      categoryCode: data.categoryCode,
      asof: data.asof,
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
        {/* 現行法令セクション */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              現行法令
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowCurrentLaw(!showCurrentLaw)}
              sx={{ ml: 1 }}
            >
              {showCurrentLaw ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton size="small" sx={{ ml: "auto" }}>
              <HelpOutlineIcon />
            </IconButton>
          </Box>

          <Collapse in={showCurrentLaw}>
            <Box sx={{ pl: 2 }}>
              {/* 時点指定 */}
              <Box sx={{ mb: 2 }}>
                <Controller
                  name="asof"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="時点指定"
                      type="date"
                      size="small"
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      sx={{ width: 200 }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* 検索モード選択 */}
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

        {/* 法令種別 */}
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

        {/* 分類 */}
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

        {/* 検索入力フィールド */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ mb: 1, display: "flex", alignItems: "center" }}
            component={Link}
            href="https://laws.e-gov.go.jp/help/#how-to-write-a-search-expression"
            target="_blank"
          >
            <IconButton size="small" sx={{ mr: 1 }}>
              <HelpOutlineIcon />
            </IconButton>
            検索式の書き方
          </Typography>

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
