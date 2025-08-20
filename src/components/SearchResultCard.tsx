import DownloadIcon from "@mui/icons-material/Download";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Grid,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import type {
  LawType,
  CurrentRevisionStatus,
} from "../gql/graphql";
import type { Law, KeywordItem } from "../types/search";
import type { FC } from "react";

interface SearchResultCardProps {
  item: Law | KeywordItem;
  index: number;
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

const sentencePositionLabels: Record<string, string> = {
  mainprovision: "本則",
  supplprovision: "附則",
  caption: "見出し",
  amendsupplprovision: "改正附則",
  relatedarticlenum: "関係する条",
  toc: "目次",
};

export const SearchResultCard: FC<SearchResultCardProps> = ({
  item,
  index,
}) => {
  const isKeywordItem = "sentences" in item;
  const law = item as Law;
  const revisionId =
    !isKeywordItem && law.currentRevisionInfo?.lawRevisionId
      ? law.currentRevisionInfo.lawRevisionId
      : law.revisionInfo?.lawRevisionId;
  const status =
    !isKeywordItem && law.currentRevisionInfo?.currentRevisionStatus
      ? law.currentRevisionInfo.currentRevisionStatus
      : law.revisionInfo?.currentRevisionStatus;

  // 環境変数からEPUBダウンロードのベースURLを取得
  const EPUB_BASE_URL =
    import.meta.env.VITE_EPUB_BASE_URL || "https://api.jplaw2epub.ngs.io";

  const handleDownloadEpub = (revisionId: string) => {
    window.open(`${EPUB_BASE_URL}/epubs/${revisionId}`, "_blank");
  };

  return (
    <Card key={law.lawInfo?.lawId ?? index} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 9 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ maxWidth: "100%" }}
              >
                {law.revisionInfo?.lawTitleKana ? (
                  <ruby>
                    {law.revisionInfo?.lawTitle}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component={"rt"}
                    >
                      {law.revisionInfo.lawTitleKana}
                    </Typography>
                  </ruby>
                ) : (
                  law.revisionInfo?.lawTitle
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
                label={
                  law.lawInfo?.lawType && lawTypeLabels[law.lawInfo.lawType]
                }
                size="small"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {law.lawInfo?.lawNum}
              </Typography>
              {law.lawInfo?.promulgationDate && (
                <Typography variant="body2" color="text.secondary">
                  公布日:{" "}
                  {new Date(law.lawInfo.promulgationDate).toLocaleDateString(
                    "ja-JP"
                  )}
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
                  <List>
                    {item.sentences.map((sentence, index) => (
                      <ListItem alignItems="flex-start" key={index}>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                span: {
                                  backgroundColor: "warning.main",
                                  color: "text.primary",
                                  padding: "0 2px",
                                  borderRadius: "2px",
                                },
                              }}
                              dangerouslySetInnerHTML={{
                                __html: sentence.text,
                              }}
                            ></Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component={"div"}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <FindInPageIcon
                                sx={{ fontSize: "1em", color: grey[400] }}
                              />
                              {sentencePositionLabels[sentence.position] ??
                                sentence.position}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={1}>
              {revisionId && (
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
              )}
            </Stack>
          </Grid>
        </Grid>

        {law.revisionInfo?.updated && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1}
          >
            最終更新:{" "}
            {new Date(law.revisionInfo.updated).toLocaleDateString("ja-JP")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};