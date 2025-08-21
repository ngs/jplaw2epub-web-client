import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchResultCard } from "./SearchResultCard";
import type { Law, KeywordItem } from "../../types/search";

// Mock environment variable
vi.mock("../../constants", async () => {
  const actual = await vi.importActual("../../constants");
  return {
    ...actual,
  };
});

describe("SearchResultCard", () => {
  const mockLaw: Law = {
    lawInfo: {
      lawId: "1",
      lawNum: "令和元年法律第一号",
      lawType: "ACT",
      promulgationDate: "2019-05-01",
    },
    revisionInfo: {
      lawRevisionId: "revision-1",
      lawTitle: "テスト法令",
      lawTitleKana: "",
      abbrev: "",
      currentRevisionStatus: "CURRENT_ENFORCED",
      updated: "2019-05-01",
    },
    currentRevisionInfo: null,
  };

  const mockKeywordItem: KeywordItem = {
    lawInfo: mockLaw.lawInfo,
    revisionInfo: mockLaw.revisionInfo,
    sentences: [
      {
        text: "この法律は、<span>テスト</span>を目的とする。",
        position: "mainprovision",
      },
    ],
  };

  beforeEach(() => {
    // Set default EPUB base URL
    vi.stubEnv("VITE_EPUB_BASE_URL", "https://example.com");
  });

  it("should render law information", () => {
    render(<SearchResultCard item={mockLaw} index={0} />);

    expect(screen.getByText("テスト法令")).toBeInTheDocument();
    expect(screen.getByText("令和元年法律第一号")).toBeInTheDocument();
  });

  it("should display law type chip", () => {
    render(<SearchResultCard item={mockLaw} index={0} />);

    expect(screen.getByText("法律")).toBeInTheDocument();
  });

  it("should display promulgate date", () => {
    render(<SearchResultCard item={mockLaw} index={0} />);

    expect(screen.getByText(/公布日:/)).toBeInTheDocument();
    // Date format can vary by locale, use getAllByText and check at least one contains the year
    const dateElements = screen.getAllByText(/2019/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("should display current revision status", () => {
    render(<SearchResultCard item={mockLaw} index={0} />);

    expect(screen.getByText("現行")).toBeInTheDocument();
  });

  it("should display repealed status for repealed laws", () => {
    const repealedLaw = {
      ...mockLaw,
      revisionInfo: {
        ...mockLaw.revisionInfo!,
        currentRevisionStatus: "REPEAL" as const,
      },
    };

    render(<SearchResultCard item={repealedLaw} index={0} />);

    expect(screen.getByText("廃止")).toBeInTheDocument();
  });

  it("should display previous enforced status for old laws", () => {
    const oldLaw = {
      ...mockLaw,
      revisionInfo: {
        ...mockLaw.revisionInfo!,
        currentRevisionStatus: "PREVIOUS_ENFORCED" as const,
      },
    };

    render(<SearchResultCard item={oldLaw} index={0} />);

    expect(screen.getByText("旧法")).toBeInTheDocument();
  });

  it("should render keyword matches when item is KeywordItem", () => {
    render(<SearchResultCard item={mockKeywordItem} index={0} />);

    expect(screen.getByText(/該当箇所:/)).toBeInTheDocument();
    // The text is rendered as HTML with <span> tags
    const textElement = screen.getByText((_, element) => {
      return (
        element?.innerHTML === "この法律は、<span>テスト</span>を目的とする。"
      );
    });
    expect(textElement).toBeInTheDocument();
  });

  it("should display position label for keyword results", () => {
    render(<SearchResultCard item={mockKeywordItem} index={0} />);

    expect(screen.getByText("本則")).toBeInTheDocument();
  });

  it("should display multiple matches for keyword search", () => {
    const multiMatchItem: KeywordItem = {
      lawInfo: mockLaw.lawInfo,
      revisionInfo: mockLaw.revisionInfo,
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

    render(<SearchResultCard item={multiMatchItem} index={0} />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
  });

  it("should render download button", () => {
    render(<SearchResultCard item={mockLaw} index={0} />);

    const downloadButton = screen.getByText("EPUBダウンロード");
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton.closest("a")).toBeInTheDocument();
  });

  it("should handle download button click", () => {
    render(<SearchResultCard item={mockLaw} index={0} />);

    const downloadButton = screen.getByText("EPUBダウンロード").closest("a");
    expect(downloadButton?.getAttribute("href")).toEqual(
      "https://example.com/epubs/revision-1"
    );
    expect(downloadButton?.getAttribute("download")).toEqual("revision-1.epub");
  });

  it("should display cabinet order type correctly", () => {
    const cabinetOrderLaw = {
      ...mockLaw,
      lawInfo: {
        ...mockLaw.lawInfo!,
        lawType: "CABINET_ORDER" as const,
      },
    };

    render(<SearchResultCard item={cabinetOrderLaw} index={0} />);

    expect(screen.getByText("政令")).toBeInTheDocument();
  });

  it("should display ministerial ordinance type correctly", () => {
    const ministerialOrdinanceLaw = {
      ...mockLaw,
      lawInfo: {
        ...mockLaw.lawInfo!,
        lawType: "MINISTERIAL_ORDINANCE" as const,
      },
    };

    render(<SearchResultCard item={ministerialOrdinanceLaw} index={0} />);

    expect(screen.getByText("府省令")).toBeInTheDocument();
  });

  it("should display misc type correctly", () => {
    const miscLaw = {
      ...mockLaw,
      lawInfo: {
        ...mockLaw.lawInfo!,
        lawType: "MISC" as const,
      },
    };

    render(<SearchResultCard item={miscLaw} index={0} />);

    expect(screen.getByText("その他")).toBeInTheDocument();
  });

  it("should format date correctly", () => {
    const lawWithDate = {
      ...mockLaw,
      lawInfo: {
        ...mockLaw.lawInfo!,
        promulgationDate: "2023-12-25",
      },
    };

    render(<SearchResultCard item={lawWithDate} index={0} />);

    // Date format can vary by locale, use getAllByText
    const dateElements = screen.getAllByText(/2023/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("should handle missing promulgate date gracefully", () => {
    const lawWithoutDate = {
      ...mockLaw,
      lawInfo: {
        ...mockLaw.lawInfo!,
        promulgationDate: "",
      },
    };

    render(<SearchResultCard item={lawWithoutDate} index={0} />);

    expect(screen.queryByText(/公布日:/)).not.toBeInTheDocument();
  });

  it("should display update date when available", () => {
    const lawWithUpdateDate = {
      ...mockLaw,
      revisionInfo: {
        ...mockLaw.revisionInfo!,
        updated: "2023-12-25",
      },
    };

    render(<SearchResultCard item={lawWithUpdateDate} index={0} />);

    expect(screen.getByText(/最終更新:/)).toBeInTheDocument();
    // Date format can vary by locale, use getAllByText
    const dateElements = screen.getAllByText(/2023/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
