import type { ApolloError } from "@apollo/client";

/**
 * Extract detailed error message from GraphQL error
 * @param error - ApolloError
 * @returns Formatted error message
 */
export const parseGraphQLError = (error: Error | ApolloError | null): string => {
  if (!error) return "An unknown error occurred";

  // For ApolloError
  if ("graphQLErrors" in error && error.graphQLErrors?.length > 0) {
    // Extract GraphQL error messages
    const messages = error.graphQLErrors.map((gqlError) => {
      const message = gqlError.message;
      
      // Try to parse API error (e.g., "API error 400: {...}")
      const apiErrorMatch = message.match(/API error \d+: ({.+})/);
      if (apiErrorMatch) {
        try {
          const apiError = JSON.parse(apiErrorMatch[1]);
          return apiError.message || message;
        } catch {
          // Return original message if JSON parse fails
          return message;
        }
      }
      
      return message;
    });

    return messages.join("\n");
  }

  // For network error
  if ("networkError" in error && error.networkError) {
    return "A network error occurred. Please check your connection.";
  }

  // For regular Error
  return error.message || "An error occurred";
};