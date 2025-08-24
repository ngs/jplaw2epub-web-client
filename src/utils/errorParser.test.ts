import { ApolloError } from "@apollo/client";
import { describe, it, expect } from "vitest";
import { parseGraphQLError } from "./errorParser";
import type { GraphQLError } from "graphql";

describe("parseGraphQLError", () => {
  it("should return default message for null error", () => {
    const result = parseGraphQLError(null);
    expect(result).toBe("An unknown error occurred");
  });

  it("should return message from regular Error", () => {
    const error = new Error("Test error message");
    const result = parseGraphQLError(error);
    expect(result).toBe("Test error message");
  });

  it("should return default message for Error without message", () => {
    const error = new Error();
    const result = parseGraphQLError(error);
    expect(result).toBe("An error occurred");
  });

  it("should parse GraphQL errors from ApolloError", () => {
    const graphQLErrors: GraphQLError[] = [
      {
        message: "Field error 1",
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
      {
        message: "Field error 2",
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
    ] as GraphQLError[];

    const apolloError = new ApolloError({
      graphQLErrors,
    });

    const result = parseGraphQLError(apolloError);
    expect(result).toBe("Field error 1\nField error 2");
  });

  it("should parse API error from GraphQL error message", () => {
    const graphQLErrors: GraphQLError[] = [
      {
        message: 'API error 400: {"message": "Invalid date range"}',
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
    ] as GraphQLError[];

    const apolloError = new ApolloError({
      graphQLErrors,
    });

    const result = parseGraphQLError(apolloError);
    expect(result).toBe("Invalid date range");
  });

  it("should handle API error with invalid JSON", () => {
    const graphQLErrors: GraphQLError[] = [
      {
        message: "API error 400: {invalid json}",
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
    ] as GraphQLError[];

    const apolloError = new ApolloError({
      graphQLErrors,
    });

    const result = parseGraphQLError(apolloError);
    expect(result).toBe("API error 400: {invalid json}");
  });

  it("should handle API error without message field", () => {
    const graphQLErrors: GraphQLError[] = [
      {
        message: 'API error 400: {"error": "Something wrong"}',
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
    ] as GraphQLError[];

    const apolloError = new ApolloError({
      graphQLErrors,
    });

    const result = parseGraphQLError(apolloError);
    expect(result).toBe('API error 400: {"error": "Something wrong"}');
  });

  it("should handle network error", () => {
    const apolloError = new ApolloError({
      networkError: new Error("Network failure"),
    });

    const result = parseGraphQLError(apolloError);
    expect(result).toBe(
      "A network error occurred. Please check your connection.",
    );
  });

  it("should prioritize GraphQL errors over network error", () => {
    const graphQLErrors: GraphQLError[] = [
      {
        message: "GraphQL error",
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
    ] as GraphQLError[];

    const apolloError = new ApolloError({
      graphQLErrors,
      networkError: new Error("Network failure"),
    });

    const result = parseGraphQLError(apolloError);
    expect(result).toBe("GraphQL error");
  });

  it("should handle ApolloError without errors", () => {
    const apolloError = new ApolloError({});
    const result = parseGraphQLError(apolloError);
    expect(result).toBe("An error occurred");
  });

  it("should handle multiple API errors with different formats", () => {
    const graphQLErrors: GraphQLError[] = [
      {
        message: 'API error 400: {"message": "Date out of range"}',
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
      {
        message: "Regular GraphQL error",
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
      {
        message: 'API error 500: {"message": "Server error"}',
        nodes: undefined,
        source: undefined,
        positions: undefined,
        path: undefined,
        extensions: {},
      },
    ] as GraphQLError[];

    const apolloError = new ApolloError({
      graphQLErrors,
    });

    const result = parseGraphQLError(apolloError);
    expect(result).toBe(
      "Date out of range\nRegular GraphQL error\nServer error",
    );
  });
});
