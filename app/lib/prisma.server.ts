import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";

// union of one
export type Discount = SetDiscount;

export interface SetDiscount {
  // was originated from GraphQL
  __typename: "SetDiscount";
  id: string;
  itemIds: string[];
  amount: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type TokenResult = RESTPostOAuth2AccessTokenResult;
    type Discounts = Discount[];
  }
}
