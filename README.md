# Japanese Law Search & EPUB Download Web Client

A web application for searching Japanese laws and downloading them in EPUB format.

## Overview

This application provides an interface to search Japanese laws using the e-Gov Law Search API and download them as EPUB files for easy reading on e-readers and tablets.

## Features

- **Law Name Search**: Search laws by keywords
- **Law Number Search**: Direct search by law number
- **EPUB Download**: Download selected laws in EPUB format
- **Point-in-Time Laws**: Retrieve law content as of a specific date (from April 1, 2017)
- **Search Filters**: Filter by law types and categories

## Tech Stack

- **Framework**: React 19 + TypeScript
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Hook Form
- **API Communication**: Apollo Client (GraphQL)
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/ngs/jplaw2epub-web-client.git
cd jplaw2epub-web-client

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_GRAPHQL_ENDPOINT=https://your-api-endpoint/graphql
```

### Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
```

Build artifacts will be generated in the `dist/` directory.

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── SearchForm.tsx
│   ├── SearchResults.tsx
│   └── SearchResultCard.tsx
├── constants/       # Constant definitions
│   ├── colors.ts
│   ├── lawCategories.ts
│   └── pagination.ts
├── hooks/          # Custom hooks
│   └── useQueryParams.ts
├── queries/        # GraphQL queries
│   └── index.ts
├── types/          # TypeScript type definitions
│   └── search.ts
├── utils/          # Utility functions
│   ├── errorParser.ts
│   └── lawNumberParser.ts
├── App.tsx
├── main.tsx
└── theme.ts       # MUI theme configuration

vite-plugins/      # Custom Vite plugins
├── markdown-to-html.ts      # Markdown to HTML conversion (build)
├── markdown-dev-server.ts   # Markdown to HTML conversion (dev)
└── shared/
    ├── html-template.ts     # HTML template
    └── markdown-processor.ts # Markdown renderer

public-docs/       # Documentation (Markdown)
└── help.md
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # ESLint check
npm run typecheck # TypeScript check
```

## Documentation

- [Help Page](/help/) - Application usage guide
- [CLAUDE.md](./CLAUDE.md) - Documentation for AI development assistants

## Related Projects

- [jplaw2epub-web-api](https://github.com/ngs/jplaw2epub-web-api) - GraphQL API server
- [jplaw2epub](https://github.com/ngs/jplaw2epub) - Core EPUB conversion library

## License

[MIT License](./LICENSE.md)

## Author

[Atsushi Nagase](https://ja.ngs.io)

## Contributing

Issue reports and Pull Requests are welcome.

### Development Process

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/ngs/jplaw2epub-web-client/issues)
- **Contact**: [a@ngs.io](mailto:a@ngs.io)