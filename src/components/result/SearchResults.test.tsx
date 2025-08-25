import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchResults } from "./SearchResults";
import type { Law, KeywordItem } from "../../types/search";
import type { ApolloError } from "@apollo/client";

describe("SearchResults", () => {
  const mockOnPageChange = vi.fn();

  const mockLaws: Law[] = [
    {
      lawInfo: {
        lawId: "1",
        lawNum: "令和元年法律第一号",
        lawType: "ACT",
        promulgationDate: "2019-05-01",
      },
      revisionInfo: {
        lawRevisionId: "revision-1",
        lawTitle: "テスト法令1",
        lawTitleKana: "",
        abbrev: "",
        currentRevisionStatus: "CURRENT_ENFORCED",
        updated: "2019-05-01",
      },
      currentRevisionInfo: null,
    },
    {
      lawInfo: {
        lawId: "2",
        lawNum: "令和二年法律第二号",
        lawType: "CABINET_ORDER",
        promulgationDate: "2020-05-01",
      },
      revisionInfo: {
        lawRevisionId: "revision-2",
        lawTitle: "テスト法令2",
        lawTitleKana: "",
        abbrev: "",
        currentRevisionStatus: "CURRENT_ENFORCED",
        updated: "2020-05-01",
      },
      currentRevisionInfo: null,
    },
  ];

  const mockKeywordItems: KeywordItem[] = [
    {
      lawInfo: mockLaws[0].lawInfo,
      revisionInfo: mockLaws[0].revisionInfo,
      sentences: [
        {
          text: "この法律は、<span>テスト</span>を目的とする。",
          position: "mainprovision",
        },
      ],
    },
  ];

  const defaultProps = {
    totalCount: 2,
    currentPage: 1,
    itemsPerPage: 10,
    onPageChange: mockOnPageChange,
    loading: false,
  };

  it("should render search results when laws are provided", () => {
    render(<SearchResults {...defaultProps} laws={mockLaws} />);

    expect(screen.getByText("検索結果: 2件")).toBeInTheDocument();
    expect(screen.getByText("テスト法令1")).toBeInTheDocument();
    expect(screen.getByText("テスト法令2")).toBeInTheDocument();
  });

  it("should render keyword search results when keywordItems are provided", () => {
    render(
      <SearchResults
        {...defaultProps}
        keywordItems={mockKeywordItems}
        searchMode="keyword"
        totalCount={1}
      />,
    );

    expect(screen.getByText("検索結果: 1件")).toBeInTheDocument();
    expect(screen.getByText("テスト法令1")).toBeInTheDocument();
    expect(screen.getByText(/該当箇所:/)).toBeInTheDocument();
  });

  it("should show loading skeletons when loading", () => {
    render(<SearchResults {...defaultProps} loading={true} />);

    // Check for skeleton elements
    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should show no results message when empty", () => {
    render(<SearchResults {...defaultProps} laws={[]} totalCount={0} />);

    expect(
      screen.getByText(
        "検索結果が見つかりませんでした。検索条件を変更してお試しください。",
      ),
    ).toBeInTheDocument();
  });

  it("should display error message when error is provided", () => {
    const mockError: ApolloError = {
      name: "ApolloError",
      message: "Network error",
      graphQLErrors: [],
      protocolErrors: [],
      clientErrors: [],
      networkError: null,
      extraInfo: {},
      cause: null,
    };

    render(<SearchResults {...defaultProps} error={mockError} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
  });

  it("should render pagination when there are multiple pages", () => {
    render(<SearchResults {...defaultProps} laws={mockLaws} totalCount={50} />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should call onPageChange when pagination is clicked", () => {
    render(<SearchResults {...defaultProps} laws={mockLaws} totalCount={50} />);

    const page2Button = screen.getByRole("button", { name: "Go to page 2" });
    fireEvent.click(page2Button);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("should calculate correct page count", () => {
    render(
      <SearchResults
        {...defaultProps}
        laws={mockLaws}
        totalCount={25}
        itemsPerPage={10}
      />,
    );

    // Should have 3 pages (25 items / 10 per page = 3 pages)
    expect(
      screen.getByRole("button", { name: "Go to page 3" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Go to page 4" }),
    ).not.toBeInTheDocument();
  });

  it("should highlight current page in pagination", () => {
    render(
      <SearchResults
        {...defaultProps}
        laws={mockLaws}
        totalCount={50}
        currentPage={2}
      />,
    );

    const page2Button = screen.getByRole("button", { name: "page 2" });
    expect(page2Button).toHaveAttribute("aria-current", "page");
  });

  it("should show loading state with skeleton cards", () => {
    render(<SearchResults {...defaultProps} loading={true} />);

    // Check for skeleton elements
    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render correctly with no pagination when single page", () => {
    render(
      <SearchResults
        {...defaultProps}
        laws={mockLaws}
        totalCount={2}
        itemsPerPage={10}
      />,
    );

    // Should not show pagination for single page
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("should handle keyword search with multiple matches", () => {
    const multiMatchItem: KeywordItem = {
      lawInfo: mockLaws[0].lawInfo,
      revisionInfo: mockLaws[0].revisionInfo,
      sentences: [
        {
          text: "この法律は、<span>テスト</span>を目的とする。",
          position: "mainprovision",
        },
        {
          text: "この法律において「<span>テスト</span>」とは、",
          position: "mainprovision",
        },
      ],
    };

    render(
      <SearchResults
        {...defaultProps}
        keywordItems={[multiMatchItem]}
        searchMode="keyword"
        totalCount={1}
      />,
    );

    // Check that the component renders properly with multiple matches
    expect(screen.getByText("テスト法令1")).toBeInTheDocument();
    expect(screen.getByText(/該当箇所:/)).toBeInTheDocument();
  });
});
