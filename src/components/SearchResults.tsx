import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Grid,
  Pagination,
  Alert,
  Skeleton,
  Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import type { LawType, CurrentRevisionStatus } from "../gql/graphql";

interface Law {
  lawInfo: {
    lawId: string;
    lawNum: string;
    lawType: LawType;
    promulgationDate?: string | null;
  };
  revisionInfo: {
    lawRevisionId: string;
    lawTitle: string;
    lawTitleKana?: string | null;
    abbrev?: string | null;
    updated?: string | null;
    currentRevisionStatus?: CurrentRevisionStatus | null;
  };
  currentRevisionInfo?: {
    lawRevisionId: string;
    lawTitle: string;
    currentRevisionStatus?: CurrentRevisionStatus | null;
  } | null;
}

interface KeywordItem {
  lawInfo: {
    lawId: string;
    lawNum: string;
    lawType: LawType;
    promulgationDate?: string | null;
  };
  revisionInfo: {
    lawRevisionId: string;
    lawTitle: string;
    lawTitleKana?: string | null;
    abbrev?: string | null;
    updated?: string | null;
    currentRevisionStatus?: CurrentRevisionStatus | null;
  };
  sentences?: Array<{
    text: string;
    position: number;
  }>;
}

interface SearchResultsProps {
  laws?: Law[];
  keywordItems?: KeywordItem[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  error?: Error | null;
  searchMode?: "law" | "keyword";
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

const revisionStatusConfig: {
  [K in CurrentRevisionStatus]: {
    label: string;
    color: "success" | "warning" | "default";
  };
} = {
  CURRENT_ENFORCED: { label: "現行", color: "success" },
  PREVIOUS_ENFORCED: { label: "旧法", color: "default" },
  REPEAL: { label: "廃止", color: "default" },
  UNENFORCED: { label: "未施行", color: "warning" },
};

export const SearchResults: React.FC<SearchResultsProps> = ({
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

  // 環境変数からEPUBダウンロードのベースURLを取得
  const EPUB_BASE_URL =
    import.meta.env.VITE_EPUB_BASE_URL || "https://api.jplaw2epub.ngs.io";

  const handleDownloadEpub = (revisionId: string) => {
    window.open(`${EPUB_BASE_URL}/epubs/${revisionId}`, "_blank");
  };

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
    return (
      <Alert severity="error">
        検索中にエラーが発生しました: {error.message}
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
        検索結果: {totalCount}件
      </Typography>

      {items.map((item) => {
        const isKeywordItem = "sentences" in item;
        const law = item as Law;
        const revisionId =
          !isKeywordItem && law.currentRevisionInfo?.lawRevisionId
            ? law.currentRevisionInfo.lawRevisionId
            : law.revisionInfo.lawRevisionId;
        const status =
          !isKeywordItem && law.currentRevisionInfo?.currentRevisionStatus
            ? law.currentRevisionInfo.currentRevisionStatus
            : law.revisionInfo.currentRevisionStatus;

        return (
          <Card key={law.lawInfo.lawId} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Typography variant="h6" component="h3">
                      {law.revisionInfo.lawTitleKana ? (
                        <ruby>
                          {law.revisionInfo.lawTitle}
                          <rt>{law.revisionInfo.lawTitleKana}</rt>
                        </ruby>
                      ) : (
                        law.revisionInfo.lawTitle
                      )}
                    </Typography>
                    {status && revisionStatusConfig[status] && (
                      <Chip
                        label={revisionStatusConfig[status].label}
                        color={revisionStatusConfig[status].color}
                        size="small"
                      />
                    )}
                  </Stack>

                  <Stack direction="row" spacing={2} mb={1}>
                    <Chip
                      label={lawTypeLabels[law.lawInfo.lawType]}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {law.lawInfo.lawNum}
                    </Typography>
                    {law.lawInfo.promulgationDate && (
                      <Typography variant="body2" color="text.secondary">
                        公布日:{" "}
                        {new Date(
                          law.lawInfo.promulgationDate
                        ).toLocaleDateString("ja-JP")}
                      </Typography>
                    )}
                  </Stack>

                  {isKeywordItem &&
                    "sentences" in item &&
                    item.sentences &&
                    item.sentences.length > 0 && (
                      <Box mt={2}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          該当箇所:
                        </Typography>
                        {item.sentences.slice(0, 3).map((sentence, index) => (
                          <Box key={index} sx={{ pl: 2, mb: 1 }}>
                            <Typography variant="body2">
                              ...{sentence.text}...
                            </Typography>
                          </Box>
                        ))}
                        {item.sentences.length > 3 && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ pl: 2 }}
                          >
                            他 {item.sentences.length - 3} 件
                          </Typography>
                        )}
                      </Box>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack spacing={1}>
                    <Tooltip title="EPUBをダウンロード">
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadEpub(revisionId)}
                      >
                        EPUBダウンロード
                      </Button>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>

              {law.revisionInfo.updated && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={1}
                >
                  最終更新:{" "}
                  {new Date(law.revisionInfo.updated).toLocaleDateString(
                    "ja-JP"
                  )}
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}

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
