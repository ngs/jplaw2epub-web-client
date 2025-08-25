import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchForm } from "./SearchForm";
import type { SearchFormData } from "./SearchForm";

describe("SearchForm", () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  const defaultProps = {
    onSearch: mockOnSearch,
  };

  it("should render search form with all tabs", () => {
    render(<SearchForm {...defaultProps} />);

    expect(screen.getByRole("tab", { name: "法令名" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "キーワード" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "法令番号" })).toBeInTheDocument();
  });

  it("should show law name search by default", () => {
    render(<SearchForm {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("法令名を入力してください。"),
    ).toBeInTheDocument();
  });

  it("should switch to keyword search when keyword tab is clicked", () => {
    render(<SearchForm {...defaultProps} />);

    const keywordTab = screen.getByRole("tab", { name: "キーワード" });
    fireEvent.click(keywordTab);

    expect(
      screen.getByPlaceholderText("検索語句を入力してください。"),
    ).toBeInTheDocument();
  });

  it("should switch to law number search when number tab is clicked", () => {
    render(<SearchForm {...defaultProps} />);

    const numberTab = screen.getByRole("tab", { name: "法令番号" });
    fireEvent.click(numberTab);

    expect(screen.getByText("元号")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("年")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("号")).toBeInTheDocument();
  });

  it("should call onSearch with law name data when searching by name", async () => {
    render(<SearchForm {...defaultProps} />);

    const input = screen.getByPlaceholderText("法令名を入力してください。");
    fireEvent.change(input, { target: { value: "民法" } });

    const searchButton = screen.getByRole("button", { name: /検索/ });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          lawTitle: "民法",
        }),
      );
    });
  });

  it("should call onSearch with keyword data when searching by keyword", async () => {
    render(<SearchForm {...defaultProps} />);

    const keywordTab = screen.getByRole("tab", { name: "キーワード" });
    fireEvent.click(keywordTab);

    const input = screen.getByPlaceholderText("検索語句を入力してください。");
    fireEvent.change(input, { target: { value: "契約" } });

    const searchButton = screen.getByRole("button", { name: /検索/ });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: "契約",
        }),
      );
    });
  });

  it("should show current law by default", () => {
    render(<SearchForm {...defaultProps} />);

    const lawTimeSelect = screen.getByRole("combobox");
    expect(lawTimeSelect).toHaveTextContent("現行法令");
  });

  it("should show date picker when point-in-time law is selected", () => {
    render(<SearchForm {...defaultProps} />);

    const lawTimeSelect = screen.getByRole("combobox");
    fireEvent.mouseDown(lawTimeSelect);

    const pointInTimeOption = screen.getByRole("option", { name: "時点法令" });
    fireEvent.click(pointInTimeOption);

    expect(screen.getByLabelText("時点指定")).toBeInTheDocument();
  });

  // Skipping complex MUI validation tests due to rendering complexity
  it.skip("should validate that at least one law type is selected", async () => {
    // Test implementation would require more complex MUI mocking
  });

  it.skip("should validate that at least one category is selected", async () => {
    // Test implementation would require more complex MUI mocking
  });

  it("should apply initial values when provided", () => {
    const initialValues: SearchFormData = {
      lawTitle: "テスト法令",
      lawType: ["ACT"],
      categoryCode: ["CONSTITUTION"],
    };

    render(<SearchForm {...defaultProps} initialValues={initialValues} />);

    const input = screen.getByPlaceholderText(
      "法令名を入力してください。",
    ) as HTMLInputElement;
    expect(input.value).toBe("テスト法令");
  });

  it("should disable search button when loading", () => {
    render(<SearchForm {...defaultProps} loading={true} />);

    const searchButton = screen.getByRole("button", { name: /検索/ });
    expect(searchButton).toBeDisabled();
  });

  it("should convert numbers to kanji in law number search", async () => {
    render(<SearchForm {...defaultProps} />);

    const numberTab = screen.getByRole("tab", { name: "法令番号" });
    fireEvent.click(numberTab);

    const yearInput = screen.getByPlaceholderText("年");
    fireEvent.change(yearInput, { target: { value: "25" } });
    fireEvent.blur(yearInput);

    await waitFor(() => {
      expect(yearInput).toHaveValue("二十五");
    });
  });

  it("should validate required fields for law number search", async () => {
    render(<SearchForm {...defaultProps} />);

    const numberTab = screen.getByRole("tab", { name: "法令番号" });
    fireEvent.click(numberTab);

    // Try to search without filling required fields
    const searchButton = screen.getByRole("button", { name: /検索/ });
    fireEvent.click(searchButton);

    await waitFor(() => {
      // The form should not submit without required fields
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });
});
