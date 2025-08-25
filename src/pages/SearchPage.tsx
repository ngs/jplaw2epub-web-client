import { useQuery } from "@apollo/client";
import { Container, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { SearchForm } from "../components/form/SearchForm";
import { AppHeader } from "../components/global/AppHeader";
import { SearchResults } from "../components/result/SearchResults";
import { ITEMS_PER_PAGE } from "../constants";
import { SEARCH_LAWS, KEYWORD_SEARCH } from "../graphql/queries";
import { useQueryParams } from "../hooks/useQueryParams";
import type { SearchFormData } from "../components/form/SearchForm";
import type { MouseEvent } from "react";

export const SearchPage = () => {
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

  // Check if search parameters are valid
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
      // Automatically start search if URL has search parameters
      setShouldSearch(true);
    } else {
      // Reset form if URL parameters are empty
      setSearchParams({});
      setShouldSearch(false);
    }
    setIsInitialized(true);
  }, [location.search, getSearchParamsFromURL]);

  const handleSearch = (data: SearchFormData) => {
    // Create clean data by excluding empty values
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

    setSearchParams(cleanedData);
    updateURLParams(cleanedData);
    setCurrentPage(1);
    setShouldSearch(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page, { updateURL: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHomeClick = (e: MouseEvent) => {
    // Prevent default link behavior
    e.preventDefault();
    // Reset form and URL parameters
    setSearchParams({});
    setShouldSearch(false);
    // Clear URL parameters (this performs actual navigation)
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
      <AppHeader onHomeClick={handleHomeClick} />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <SearchForm
            key={`${location.search}-${isInitialized ? "initialized" : "loading"}`} // Remount on URL change
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
};
