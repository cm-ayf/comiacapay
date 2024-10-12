// union of one
export type Discount = SetDiscount;

export interface SetDiscount {
  itemIds: string[];
  amount: number;
}
