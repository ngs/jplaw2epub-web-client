import type {
  SearchLawsQuery,
  KeywordSearchQuery,
  GetEpubQuery,
} from "../gql/graphql";

export type Law = SearchLawsQuery["laws"]["laws"][number];
export type KeywordItem = KeywordSearchQuery["keyword"]["items"][number];
export type Epub = GetEpubQuery["epub"];
