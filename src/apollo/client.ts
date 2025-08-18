import { ApolloClient, InMemoryCache } from '@apollo/client';

// 環境変数からエンドポイントを取得（デフォルト値付き）
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://api.jplaw2epub.ngs.io/graphql';

export const apolloClient = new ApolloClient({
  uri: GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});