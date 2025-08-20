# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese Law Search and EPUB Download web application that provides an interface to search Japanese laws and download them as EPUB files. The application interfaces with the jplaw2epub GraphQL API to search laws by name, keyword, or law number, and allows filtering by law types and categories.

## Key Commands

```bash
# Development
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint -- --fix  # Auto-fix ESLint issues

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