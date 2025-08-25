import { gql } from "@apollo/client";

export const SEARCH_LAWS = gql`
  query SearchLaws(
    $lawTitle: String
    $lawTitleKana: String
    $lawNum: String
    $lawType: [LawType!]
    $categoryCode: [CategoryCode!]
    $asof: String
    $promulgateDateFrom: String
    $promulgateDateTo: String
    $limit: Int
    $offset: Int
  ) {
    laws(
      lawTitle: $lawTitle
      lawTitleKana: $lawTitleKana
      lawNum: $lawNum
      lawType: $lawType
      categoryCode: $categoryCode
      asof: $asof
      promulgateDateFrom: $promulgateDateFrom
      promulgateDateTo: $promulgateDateTo
      limit: $limit
      offset: $offset
    ) {
      totalCount
      nextOffset
      laws {
        lawInfo {
          lawId
          lawNum
          lawType
          promulgationDate
        }
        revisionInfo {
          lawRevisionId
          lawTitle
          lawTitleKana
          abbrev
          updated
          currentRevisionStatus
        }
        currentRevisionInfo {
          lawRevisionId
          lawTitle
          currentRevisionStatus
        }
      }
    }
  }
`;

export const KEYWORD_SEARCH = gql`
  query KeywordSearch(
    $keyword: String!
    $lawNum: String
    $lawType: [LawType!]
    $categoryCode: [CategoryCode!]
    $asof: String
    $promulgateDateFrom: String
    $promulgateDateTo: String
    $limit: Int
    $offset: Int
    $sentencesLimit: Int
  ) {
    keyword(
      keyword: $keyword
      lawNum: $lawNum
      lawType: $lawType
      categoryCode: $categoryCode
      asof: $asof
      promulgateDateFrom: $promulgateDateFrom
      promulgateDateTo: $promulgateDateTo
      limit: $limit
      offset: $offset
      sentencesLimit: $sentencesLimit
    ) {
      totalCount
      sentenceCount
      nextOffset
      items {
        lawInfo {
          lawId
          lawNum
          lawType
          promulgationDate
        }
        revisionInfo {
          lawRevisionId
          lawTitle
          lawTitleKana
          abbrev
          updated
          currentRevisionStatus
        }
        sentences {
          text
          position
        }
      }
    }
  }
`;

export const GET_REVISIONS = gql`
  query GetRevisions($lawId: String!) {
    revisions(lawId: $lawId) {
      lawInfo {
        lawId
        lawNum
        lawType
        promulgationDate
      }
      revisions {
        lawRevisionId
        lawTitle
        lawTitleKana
        abbrev
        amendmentLawId
        amendmentLawTitle
        amendmentLawNum
        amendmentPromulgateDate
        amendmentEnforcementDate
        repealDate
        remainInForce
        updated
        currentRevisionStatus
        repealStatus
      }
    }
  }
`;

export const EPUB = gql`
  query GetEpub($id: String!) {
    epub(id: $id) {
      signedUrl
      id
      status
      error
    }
  }
`;
