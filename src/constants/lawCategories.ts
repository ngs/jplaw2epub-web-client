import type { LawType } from "../gql/graphql";

export const lawCategories: { label: string; value: LawType }[] = [
  {
    label: "憲法",
    value: "CONSTITUTION" as LawType,
  },
  {
    label: "法律",
    value: "ACT" as LawType,
  },
  {
    label: "政令",
    value: "CABINET_ORDER" as LawType,
  },
  {
    label: "勅令",
    value: "IMPERIAL_ORDER" as LawType,
  },
  {
    label: "府省令",
    value: "MINISTERIAL_ORDINANCE" as LawType,
  },
  {
    label: "規則",
    value: "RULE" as LawType,
  },
  {
    label: "その他",
    value: "MISC" as LawType,
  },
];
