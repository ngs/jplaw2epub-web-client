import type { SearchLawsQuery, KeywordSearchQuery } from "../gql/graphql";

export type Law = SearchLawsQuery["laws"]["laws"][number];
export type KeywordItem = KeywordSearchQuery["keyword"]["items"][number];