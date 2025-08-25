# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Guidelines

**IMPORTANT: All documentation, code comments, and commit messages MUST be written in English.**

- Documentation files (README.md, CLAUDE.md, etc.) - English only
- Code comments - English only
- Commit messages - English only
- Variable names, function names - English preferred (existing Japanese names may remain)
- User-facing content (UI text, help.md) - May be in Japanese as this is a Japanese law application

## Project Overview

This is a Japanese Law Search and EPUB Download web application that provides an interface to search Japanese laws and download them as EPUB files. The application interfaces with the jplaw2epub GraphQL API to search laws by name, keyword, or law number, and allows filtering by law types and categories.

## Key Commands

```bash
# Development
npm run dev          # Start development server with HMR (also serves markdown docs)
npm run build        # Build for production (includes HTML generation from markdown)
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint -- --fix  # Auto-fix ESLint issues
npm run typecheck    # Run TypeScript type checking

# Testing
npm test             # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright

# GraphQL Code Generation
npm run codegen      # Generate TypeScript types from GraphQL schema
npm run codegen:watch  # Watch mode for codegen
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

- `VITE_GRAPHQL_ENDPOINT` - GraphQL API endpoint (default: https://api.jplaw2epub.ngs.io/graphql)
- `VITE_EPUB_BASE_URL` - EPUB download base URL (default: https://api.jplaw2epub.ngs.io)

## Architecture

### Core Technology Stack

- **React 19** with TypeScript
- **Apollo Client** for GraphQL communication
- **React Router v7** for navigation
- **Material-UI (MUI) v7** for UI components
- **React Hook Form** for form management
- **Vite** as build tool

### Key Architectural Patterns

1. **Search State Management**: Search parameters are synchronized with URL query parameters via `useQueryParams` hook, enabling bookmarkable searches and browser back/forward navigation.

2. **Form State**: SearchForm uses React Hook Form with controlled components. Law number inputs support Japanese kanji numerals with automatic conversion from Arabic/full-width numbers.

3. **Error Handling**: GraphQL errors are parsed to extract API-specific error messages (e.g., date range restrictions) and displayed to users in a readable format.

4. **Type Safety**: GraphQL types are auto-generated from the schema using GraphQL Code Generator, ensuring type safety across the application.

### Important Business Logic

1. **Law Number Format**: Law numbers follow the pattern `{era}{year}年{type}第{number}号` where year and number must be in kanji numerals. The `convertToKanji` utility handles automatic conversion.

2. **Search Modes**:
   - Law name search (`lawTitle`)
   - Keyword search (`keyword`) - searches within law content
   - Law number search (`lawNum`) - exact law number matching

3. **Date Restrictions**: The `asof` parameter (point-in-time law) must be between 2017-04-01 and today.

4. **Default Selections**: When no law types or categories are specified, all are selected by default. URL parameters omit these when all are selected to keep URLs clean.

## Code Style and Linting Rules

The project enforces strict ESLint rules:

1. **No React namespace**: Use named imports (`import type { FC } from 'react'`) instead of `React.FC`
2. **Type-only imports**: Use `import type` for type-only imports
3. **Import ordering**: Imports are automatically sorted alphabetically within groups
4. **No console.log**: Only `console.warn` and `console.error` are allowed
5. **English comments**: All code comments must be in English
6. **Unused variables**: Variables starting with underscore (\_) are allowed to be unused

## GraphQL Integration

The application uses Apollo Client with:

- Cache-and-network fetch policy for optimal performance
- Automatic type generation from GraphQL schema
- Two main queries: `SEARCH_LAWS` and `KEYWORD_SEARCH`

Run `npm run codegen` after modifying GraphQL queries to regenerate types.

## Component Structure

- **SearchForm**: Main search interface with e-Gov law site-style UI
- **SearchResults**: Displays paginated search results
- **SearchResultCard**: Individual result card with law details and EPUB download button
- **AppHeader**: Navigation header with home link

## Utilities

- `convertToKanji`: Converts numbers to Japanese kanji numerals
- `lawNumberParser`: Parses and builds law number strings
- `errorParser`: Extracts readable messages from GraphQL errors
- `useQueryParams`: Synchronizes form state with URL parameters

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchForm.tsx      # Main search form with tabs
│   ├── SearchResults.tsx   # Search results container
│   └── SearchResultCard.tsx # Individual search result card
├── constants/           # Constant definitions
│   ├── colors.ts           # Color palette for theme
│   ├── lawCategories.ts    # Law category definitions
│   ├── lawTypes.ts         # Law type definitions
│   └── pagination.ts       # Pagination constants
├── hooks/               # Custom React hooks
│   └── useQueryParams.ts   # URL query parameter sync
├── queries/             # GraphQL queries
│   └── index.ts           # All GraphQL query definitions
├── types/               # TypeScript type definitions
│   └── search.ts          # Search-related types
├── utils/               # Utility functions
│   ├── errorParser.ts     # GraphQL error parsing
│   └── lawNumberParser.ts # Law number parsing/building
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── theme.ts             # MUI theme configuration

vite-plugins/            # Custom Vite plugins
├── markdown-to-html.ts     # Production markdown → HTML
├── markdown-dev-server.ts  # Development markdown server
└── shared/              # Shared plugin utilities
    ├── html-template.ts    # MUI-styled HTML template
    └── markdown-processor.ts # Markdown rendering with anchors

public-docs/             # Documentation in Markdown
└── help.md                # User help documentation
```

## Markdown Documentation System

The project includes a custom markdown documentation system:

1. **Development**: Markdown files in `public-docs/` are served as HTML at `/{filename}/` routes
2. **Production**: Markdown files are converted to static HTML during build
3. **Features**:
   - MUI-styled HTML output matching app theme
   - Syntax highlighting for code blocks
   - Anchor links on h2 and h3 headings
   - Responsive design

## Recent Changes and Patterns

### Constants Extraction

All fixed values are extracted to separate files in `src/constants/`:

- Law categories, types, and era options
- Pagination settings
- Color palette (shared between theme and static HTML)

### Error Handling Pattern

GraphQL errors are parsed to extract API-specific messages:

```typescript
const errorMessage = parseGraphQLError(error);
```

### Form State Management

Forms use React Hook Form with internal state that extends base types:

```typescript
interface InternalFormData extends SearchFormData {
  // Additional internal fields
}
```

### URL Parameter Synchronization

Search state is persisted in URL for bookmarkable searches:

```typescript
const { params, updateParams } = useQueryParams();
```

### Markdown Rendering

Custom marked renderer adds features:

- Heading anchors with slugs
- Syntax highlighting via highlight.js
- Japanese character support in slugs

## CI/CD Configuration

### GitHub Actions Workflow

The project uses GitHub Actions for continuous integration with the following jobs:

- **lint**: Runs ESLint for code style checking
- **type-check**: Validates TypeScript types
- **test**: Executes unit tests with Vitest
- **e2e**: Runs Playwright end-to-end tests
- **build**: Builds the production bundle

### Performance Optimizations

- **Playwright Browser Caching**: E2E tests cache Playwright browsers at `/home/runner/.cache/ms-playwright` using the Playwright version as cache key
- **npm Dependency Caching**: Node modules are cached automatically through `actions/setup-node`
- **Japanese Font Support**: E2E tests install `fonts-noto-cjk` for proper Japanese text rendering
