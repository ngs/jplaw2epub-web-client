import type { ApolloError } from "@apollo/client";

/**
 * GraphQLエラーから詳細なエラーメッセージを抽出する
 * @param error - ApolloError
 * @returns フォーマットされたエラーメッセージ
 */
export const parseGraphQLError = (error: Error | ApolloError | null): string => {
  if (!error) return "不明なエラーが発生しました";

  // ApolloErrorの場合
  if ("graphQLErrors" in error && error.graphQLErrors?.length > 0) {
    // GraphQLエラーメッセージを抽出
    const messages = error.graphQLErrors.map((gqlError) => {
      const message = gqlError.message;
      
      // APIエラーのパースを試みる（例: "API error 400: {...}"）
      const apiErrorMatch = message.match(/API error \d+: ({.+})/);
      if (apiErrorMatch) {
        try {
          const apiError = JSON.parse(apiErrorMatch[1]);
          return apiError.message || message;
        } catch {
          // JSONパースに失敗した場合は元のメッセージを返す
          return message;
        }
      }
      
      return message;
    });

    return messages.join("\n");
  }

  // ネットワークエラーの場合
  if ("networkError" in error && error.networkError) {
    return "ネットワークエラーが発生しました。接続を確認してください。";
  }

  // 通常のErrorの場合
  return error.message || "エラーが発生しました";
};