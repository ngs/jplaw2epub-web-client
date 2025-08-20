import {
  Box,
  Card,
  CardContent,
  Typography,
  Pagination,
  Alert,
  Skeleton,
} from "@mui/material";
import { parseGraphQLError } from "../utils/errorParser";
import { SearchResultCard } from "./SearchResultCard";
import type { Law, KeywordItem } from "../types/search";
import type { ApolloError } from "@apollo/client";
import type { FC } from "react";

interface SearchResultsProps {
  laws?: Law[];
  keywordItems?: KeywordItem[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  error?: Error | ApolloError | null;
  searchMode?: "law" | "keyword";
}

export const SearchResults: FC<SearchResultsProps> = ({
  laws = [],
  keywordItems = [],
  totalCount,
  currentPage,
  itemsPerPage,
  onPageChange,
  loading = false,
  error = null,
  searchMode = "law",
}) => {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const items = searchMode === "keyword" ? keywordItems : laws;

  if (loading) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (error) {
    const errorMessage = parseGraphQLError(error);
    return (
      <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
        検索中にエラーが発生しました:
        <br />
        {errorMessage}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Alert severity="info">
        検索結果が見つかりませんでした。検索条件を変更してお試しください。
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        検索結果: {totalCount.toLocaleString()}件
      </Typography>

      {items.map((item, index) => (
        <SearchResultCard key={index} item={item} index={index} />
      ))}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};
