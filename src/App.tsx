import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, Link, useLocation } from "react-router";
import { ApolloProvider } from "@apollo/client";
import {
  Container,
  Typography,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
} from "@mui/material";
import { apolloClient } from "./apollo/client";
import { SearchForm } from "./components/SearchForm";
import type { SearchFormData } from "./components/SearchForm";
import { SearchResults } from "./components/SearchResults";
import { useQueryParams } from "./hooks/useQueryParams";
import { useQuery } from "@apollo/client";
import { SEARCH_LAWS, KEYWORD_SEARCH } from "./graphql/queries";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const ITEMS_PER_PAGE = 20;

function SearchApp() {
  const location = useLocation();
  const {
    getSearchParamsFromURL,
    updateURLParams,
    getCurrentPage,
    setCurrentPage,
  } = useQueryParams();
  const [searchParams, setSearchParams] = useState<SearchFormData>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(false);

  const isKeywordSearch = !!searchParams.keyword;
  const currentPage = getCurrentPage();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  console.info(searchParams);

  // 検索条件が整っているかチェック
  const hasValidSearchParams = !!(
    searchParams.keyword ||
    searchParams.lawTitle ||
    searchParams.lawTitleKana ||
    searchParams.lawNum ||
    (searchParams.lawType && searchParams.lawType.length > 0)
  );

  const {
    data: lawsData,
    loading: lawsLoading,
    error: lawsError,
  } = useQuery(SEARCH_LAWS, {
    variables: {
      ...searchParams,
      keyword: undefined,
      limit: ITEMS_PER_PAGE,
      offset,
    },
    skip: isKeywordSearch || !shouldSearch || !hasValidSearchParams,
  });

  const {
    data: keywordData,
    loading: keywordLoading,
    error: keywordError,
  } = useQuery(KEYWORD_SEARCH, {
    variables: {
      ...searchParams,
      limit: ITEMS_PER_PAGE,
      offset,
      sentencesLimit: ITEMS_PER_PAGE,
    },
    skip: !isKeywordSearch || !shouldSearch || !hasValidSearchParams,
  });

  useEffect(() => {
    const params = getSearchParamsFromURL();
    if (Object.keys(params).length > 0) {
      setSearchParams(params);
      // URLに検索条件がある場合は自動的に検索を開始
      setShouldSearch(true);
    } else {
      // URLパラメータが空の場合はフォームをリセット
      setSearchParams({});
      setShouldSearch(false);
    }
    setIsInitialized(true);
  }, [location.search, getSearchParamsFromURL]); // URLのクエリパラメータが変わったら実行

  const handleSearch = (data: SearchFormData) => {
    console.log("handleSearch input data:", data);

    // 空の値を除外してクリーンなデータを作成
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        acc[key as keyof SearchFormData] = value;
      }
      return acc;
    }, {} as SearchFormData);

    console.log("cleanedData:", cleanedData);

    setSearchParams(cleanedData);
    updateURLParams(cleanedData);
    setCurrentPage(1);
    setShouldSearch(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page, { updateURL: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    // デフォルトのリンク動作を防ぐ
    e.preventDefault();
    // フォームとURLパラメータをリセット
    setSearchParams({});
    setShouldSearch(false);
    // URLパラメータをクリア（これが実際のナビゲーションを行う）
    updateURLParams({});
  };

  const loading =
    !isInitialized || isKeywordSearch ? keywordLoading : lawsLoading;
  const error = isKeywordSearch ? keywordError : lawsError;
  const totalCount = isKeywordSearch
    ? keywordData?.keyword?.totalCount || 0
    : lawsData?.laws?.totalCount || 0;
  const laws = lawsData?.laws?.laws || [];
  const keywordItems = keywordData?.keyword?.items || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            onClick={handleHomeClick}
            sx={{
              flexGrow: 1,
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

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <SearchForm
            onSearch={handleSearch}
            initialValues={searchParams}
            loading={loading}
          />
        </Box>

        {shouldSearch && hasValidSearchParams && (
          <SearchResults
            laws={laws}
            keywordItems={keywordItems}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            loading={loading}
            error={error}
            searchMode={isKeywordSearch ? "keyword" : "law"}
          />
        )}
      </Container>
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <SearchApp />,
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default App;
