import { useCallback } from "react";
import { useSearchParams } from "react-router";
import type { SearchFormData } from "../components/SearchForm";
import type { LawType, CategoryCode } from "../gql/graphql";

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getSearchParamsFromURL = useCallback((): SearchFormData => {
    const params: SearchFormData = {};

    const keyword = searchParams.get("keyword");
    const lawTitle = searchParams.get("lawTitle");
    const lawTitleKana = searchParams.get("lawTitleKana");
    const lawNum = searchParams.get("lawNum");
    const lawType = searchParams.get("lawType");
    const categoryCode = searchParams.get("categoryCode");
    const asof = searchParams.get("asof");
    const promulgateDateFrom = searchParams.get("promulgateDateFrom");
    const promulgateDateTo = searchParams.get("promulgateDateTo");

    if (keyword) params.keyword = keyword;
    if (lawTitle) params.lawTitle = lawTitle;
    if (lawTitleKana) params.lawTitleKana = lawTitleKana;
    if (lawNum) params.lawNum = lawNum;
    if (lawType) {
      const validTypes: LawType[] = [
        "CONSTITUTION",
        "ACT",
        "CABINET_ORDER",
        "IMPERIAL_ORDER",
        "MINISTERIAL_ORDINANCE",
        "RULE",
        "MISC",
      ];
      params.lawType = lawType
        .split(",")
        .filter((t) => validTypes.includes(t as LawType)) as LawType[];
    }
    if (categoryCode) {
      const validCategories: CategoryCode[] = [
        "ADMINISTRATIVE_ORG",
        "ADMINISTRATIVE_PROC",
        "AGRICULTURE",
        "AVIATION",
        "BUILDING_HOUSING",
        "BUSINESS",
        "CITY_PLANNING",
        "CIVIL",
        "CIVIL_SERVICE",
        "COMMERCE",
        "CONSTITUTION",
        "CRIMINAL",
        "CULTURE",
        "DEFENSE",
        "DISASTER_MANAGEMENT",
        "EDUCATION",
        "ENVIRONMENTAL_PROTECT",
        "FINANCE_GENERAL",
        "FINANCE_INSURANCE",
        "FIRE_SERVICE",
        "FISHERIES",
        "FOREIGN_AFFAIRS",
        "FOREIGN_EXCHANGE_TRADE",
        "FORESTRY",
        "FREIGHT_TRANSPORT",
        "INDUSTRY",
        "INDUSTRY_GENERAL",
        "JUDICIARY",
        "LABOR",
        "LAND",
        "LAND_TRANSPORT",
        "LOCAL_FINANCE",
        "LOCAL_GOVERNMENT",
        "MARITIME_TRANSPORT",
        "MINING",
        "NATIONAL_BONDS",
        "NATIONAL_DEVELOPMENT",
        "NATIONAL_PROPERTY",
        "NATIONAL_TAX",
        "PARLIAMENT",
        "POLICE",
        "POSTAL_SERVICE",
        "PUBLIC_HEALTH",
        "RIVERS",
        "ROADS",
        "SOCIAL_INSURANCE",
        "SOCIAL_WELFARE",
        "STATISTICS",
        "TELECOMMUNICATIONS",
        "TOURISM",
      ];
      params.categoryCode = categoryCode
        .split(",")
        .filter((c) => validCategories.includes(c as CategoryCode)) as CategoryCode[];
    }
    if (asof) params.asof = asof;
    if (promulgateDateFrom) params.promulgateDateFrom = promulgateDateFrom;
    if (promulgateDateTo) params.promulgateDateTo = promulgateDateTo;

    return params;
  }, [searchParams]);

  const updateURLParams = useCallback(
    (params: SearchFormData, options?: { replace?: boolean }) => {
      const newSearchParams = new URLSearchParams();

      if (params.keyword) newSearchParams.set("keyword", params.keyword);
      if (params.lawTitle) newSearchParams.set("lawTitle", params.lawTitle);
      if (params.lawTitleKana)
        newSearchParams.set("lawTitleKana", params.lawTitleKana);
      if (params.lawNum) newSearchParams.set("lawNum", params.lawNum);
      // 全7種類の法令種別が選択されている場合はURLパラメータに含めない
      if (params.lawType && params.lawType.length > 0 && params.lawType.length < 7) {
        newSearchParams.set("lawType", params.lawType.join(","));
      }
      // 全50種類の分類が選択されている場合はURLパラメータに含めない
      if (params.categoryCode && params.categoryCode.length > 0 && params.categoryCode.length < 50) {
        newSearchParams.set("categoryCode", params.categoryCode.join(","));
      }
      if (params.asof) newSearchParams.set("asof", params.asof);
      if (params.promulgateDateFrom)
        newSearchParams.set("promulgateDateFrom", params.promulgateDateFrom);
      if (params.promulgateDateTo)
        newSearchParams.set("promulgateDateTo", params.promulgateDateTo);

      setSearchParams(newSearchParams, { replace: options?.replace ?? false });
    },
    [setSearchParams]
  );

  const getCurrentPage = useCallback((): number => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 1;
  }, [searchParams]);

  const setCurrentPage = useCallback(
    (page: number, options?: { replace?: boolean; updateURL?: boolean }) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (page > 1) {
        newSearchParams.set("page", page.toString());
      } else {
        newSearchParams.delete("page");
      }

      if (!options?.updateURL) {
        return;
      }

      setSearchParams(newSearchParams, { replace: options?.replace ?? false });
    },
    [searchParams, setSearchParams]
  );

  return {
    getSearchParamsFromURL,
    updateURLParams,
    getCurrentPage,
    setCurrentPage,
  };
};
