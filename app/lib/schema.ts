import type { useLoaderData } from "react-router";
import {
  array,
  boolean,
  custom,
  date,
  exactOptional,
  integer,
  literal,
  minValue,
  nonEmpty,
  nullable,
  number,
  object,
  pipe,
  string,
  transform,
  union,
  url,
} from "valibot";
import type { BaseIssue, BaseSchema, InferInput, InferOutput } from "valibot";
import { Snowflake } from "./snowflake";
import type {
  Display,
  Event,
  Guild,
  Item,
  Receipt,
  Record,
  Member,
  User,
} from "~/generated/prisma";

type SerializeFrom<AppData> = ReturnType<typeof useLoaderData<AppData>>;

export function snowflake() {
  return custom<string>(
    (input) => typeof input === "string" && !!Snowflake.parse(input),
  );
}

export function dateLikeString() {
  return custom<string>(
    (input) => typeof input === "string" && !isNaN(Date.parse(input)),
  );
}

export function dateLike() {
  return union([
    date(),
    pipe(
      dateLikeString(),
      transform((input) => new Date(input)),
    ),
  ]) satisfies BaseSchema<string | Date, Date, BaseIssue<unknown>>;
}

export function uint() {
  return pipe(number(), integer(), minValue(0));
}

export type ClientUser = SerializeFrom<User>;

export type ClientGuild = SerializeFrom<Guild>;
export const UpdateGuild = object({
  readRoleId: nullable(snowflake()),
  writeRoleId: nullable(snowflake()),
  registerRoleId: nullable(snowflake()),
});
export type UpdateGuildInput = InferInput<typeof UpdateGuild>;
export type UpdateGuildOutput = InferOutput<typeof UpdateGuild>;

export type ClientMember = SerializeFrom<Member>;

export type ClientItem = SerializeFrom<Item>;
export const CreateItem = object({
  name: pipe(string(), nonEmpty("商品名を入力してください")),
  picture: nullable(
    union([
      pipe(string(), url()),
      pipe(
        literal(""),
        transform(() => null),
      ),
    ]),
  ),
  issuedAt: dateLike(),
});
export type CreateItemInput = InferInput<typeof CreateItem>;
export type CreateItemOutput = InferOutput<typeof CreateItem>;
export const UpdateItem = object({
  name: exactOptional(CreateItem.entries.name),
  picture: exactOptional(CreateItem.entries.picture),
  issuedAt: exactOptional(CreateItem.entries.issuedAt),
});
export type UpdateItemInput = InferInput<typeof UpdateItem>;
export type UpdateItemOutput = InferOutput<typeof UpdateItem>;

export type ClientEvent = SerializeFrom<Event & { displays: Display[] }>;
export const CreateEvent = object({
  name: pipe(string(), nonEmpty("イベント名を入力してください")),
  date: dateLike(),
  clone: pipe(
    nullable(snowflake()),
    transform((input) => input || null),
  ),
});
export type CreateEventInput = InferInput<typeof CreateEvent>;
export type CreateEventOutput = InferOutput<typeof CreateEvent>;
export const UpdateEvent = object({
  name: exactOptional(CreateEvent.entries.name),
  date: exactOptional(CreateEvent.entries.date),
});
export type UpdateEventInput = InferInput<typeof UpdateEvent>;
export type UpdateEventOutput = InferOutput<typeof UpdateEvent>;

export const CreateSetDiscount = object({
  __typename: literal("SetDiscount"),
  itemIds: pipe(array(snowflake()), nonEmpty()),
  amount: uint(),
});
export type CreateSetDiscountInput = InferInput<typeof CreateSetDiscount>;
export type CreateSetDiscountOutput = InferOutput<typeof CreateSetDiscount>;
export const CreateDiscount = union([CreateSetDiscount]);
export type CreateDiscountInput = InferInput<typeof CreateDiscount>;
export type CreateDiscountOutput = InferOutput<typeof CreateDiscount>;

export type ClientDisplay = SerializeFrom<Display & { item: Item }>;
export const UpsertDisplay = object({
  price: uint(),
  internalPrice: nullable(uint()),
  dedication: boolean(),
});
export type UpsertDisplayInput = InferInput<typeof UpsertDisplay>;
export type UpsertDisplayOutput = InferOutput<typeof UpsertDisplay>;

export const CreateRecord = object({
  itemId: snowflake(),
  count: uint(),
  internal: boolean(),
  dedication: boolean(),
});
export type CreateRecordInput = InferInput<typeof CreateRecord>;
export type CreateRecordOutput = InferOutput<typeof CreateRecord>;
export const CreateReceipt = object({
  id: snowflake(),
  total: uint(),
  records: pipe(array(CreateRecord), nonEmpty()),
});
export type CreateReceiptInput = InferInput<typeof CreateReceipt>;
export type CreateReceiptOutput = InferOutput<typeof CreateReceipt>;
export const CreateReceipts = array(CreateReceipt);
export type CreateReceiptsInput = InferInput<typeof CreateReceipts>;
export type CreateReceiptsOutput = InferOutput<typeof CreateReceipts>;

export type ClientReceipt = SerializeFrom<Receipt & { records: Record[] }>;
