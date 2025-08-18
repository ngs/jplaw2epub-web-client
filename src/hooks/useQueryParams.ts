import { useSearchParams, useNavigate, useLocation } from "react-router";
import { useCallback } from "react";
import type { SearchFormData } from "../components/SearchForm";
import type { LawType } from "../gql/graphql";

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const getSearchParamsFromURL = useCallback((): SearchFormData => {
    const params: SearchFormData = {};

    const keyword = searchParams.get("keyword");
    const lawTitle = searchParams.get("lawTitle");
    const lawTitleKana = searchParams.get("lawTitleKana");
    const lawNum = searchParams.get("lawNum");
    const lawType = searchParams.get("lawType");
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
      if (params.lawType && params.lawType.length > 0) {
        newSearchParams.set("lawType", params.lawType.join(","));
      }
      if (params.asof) newSearchParams.set("asof", params.asof);
      if (params.promulgateDateFrom)
        newSearchParams.set("promulgateDateFrom", params.promulgateDateFrom);
      if (params.promulgateDateTo)
        newSearchParams.set("promulgateDateTo", params.promulgateDateTo);

      // navigateを使って明示的にpushまたはreplaceを制御
      const search = newSearchParams.toString();
      const url = search ? `?${search}` : "";

      console.log("updateURLParams:", {
        currentURL: location.pathname + location.search,
        newURL: location.pathname + url,
        replace: options?.replace ?? false,
        params,
      });

      if (options?.replace) {
        navigate(location.pathname + url, { replace: true });
      } else {
        // デフォルトはpush（履歴に追加）
        navigate(location.pathname + url, { replace: false });
      }
    },
    [navigate, location.pathname]
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

      // navigateを使って明示的にpushまたはreplaceを制御
      const search = newSearchParams.toString();
      const url = search ? `?${search}` : "";

      console.log("setCurrentPage:", {
        currentURL: location.pathname + location.search,
        newURL: location.pathname + url,
        replace: options?.replace ?? false,
        page,
      });

      if (!options?.updateURL) {
        return;
      }

      if (options?.replace) {
        navigate(location.pathname + url, { replace: true });
      } else {
        // デフォルトはpush（履歴に追加）
        navigate(location.pathname + url, { replace: false });
      }
    },
    [searchParams, navigate, location.pathname, location.search]
  );

  return {
    getSearchParamsFromURL,
    updateURLParams,
    getCurrentPage,
    setCurrentPage,
  };
};
