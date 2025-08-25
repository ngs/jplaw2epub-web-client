import type { CodegenConfig } from "@graphql-codegen/cli";

// Get endpoint from environment variable (with default value)
const GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT || "https://api.jplaw2epub.ngs.io/graphql";

const config: CodegenConfig = {
  overwrite: true,
  schema: GRAPHQL_ENDPOINT,
  documents: "src/**/*.{ts,tsx}",
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: false,
        scalars: {
          ID: "string",
          Int: "number",
          Float: "number",
          Boolean: "boolean",
          String: "string",
        },
      },
    },
  },
};

export default config;
