import type { Display, Event, Item } from "@prisma/client";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import {
  array,
  boolean,
  custom,
  date,
  literal,
  nonEmpty,
  nullable,
  object,
  partial,
  pipe,
  string,
  transform,
  union,
  url,
} from "valibot";
import type { BaseIssue, BaseSchema, InferInput, InferOutput } from "valibot";
import { Snowflake } from "./snowflake";

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
  return custom<number>(
    (input) =>
      typeof input === "number" && Number.isInteger(input) && input >= 0,
  );
}

export const GuildParams = object({
  guildId: snowflake(),
});

export const ItemParams = object({
  guildId: snowflake(),
  itemId: snowflake(),
});

export const EventParams = object({
  guildId: snowflake(),
  eventId: snowflake(),
});

export const DisplayParams = object({
  guildId: snowflake(),
  eventId: snowflake(),
  itemId: snowflake(),
});

export const DiscountParams = object({
  guildId: snowflake(),
  eventId: snowflake(),
  discountId: snowflake(),
});

export const UpdateGuild = object({
  readRoleId: nullable(snowflake()),
  writeRoleId: nullable(snowflake()),
  registerRoleId: nullable(snowflake()),
});
export type UpdateGuildInput = InferInput<typeof UpdateGuild>;
export type UpdateGuildOutput = InferOutput<typeof UpdateGuild>;

export type ClientItem = Jsonify<Item>;
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
export const UpdateItem = partial(CreateItem);
export type UpdateItemInput = InferInput<typeof UpdateItem>;
export type UpdateItemOutput = InferOutput<typeof UpdateItem>;

export type ClientEvent = Jsonify<Event>;
export const CreateEvent = object({
  name: pipe(string(), nonEmpty("イベント名を入力してください")),
  date: dateLike(),
  clone: nullable(snowflake()),
});
export type CreateEventInput = InferInput<typeof CreateEvent>;
export type CreateEventOutput = InferOutput<typeof CreateEvent>;
export const UpdateEvent = partial(CreateEvent);
export type UpdateEventInput = InferInput<typeof UpdateEvent>;
export type UpdateEventOutput = InferOutput<typeof UpdateEvent>;

export const CreateSetDiscount = object({
  __typename: literal("SetDiscount"),
  itemIds: array(snowflake()),
  amount: uint(),
});
export type CreateSetDiscountInput = InferInput<typeof CreateSetDiscount>;
export type CreateSetDiscountOutput = InferOutput<typeof CreateSetDiscount>;
export const CreateDiscount = union([CreateSetDiscount]);
export type CreateDiscountInput = InferInput<typeof CreateDiscount>;
export type CreateDiscountOutput = InferOutput<typeof CreateDiscount>;

export type ClientDisplay = Jsonify<Display & { item: Item }>;
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
  records: array(CreateRecord),
});
export type CreateReceiptInput = InferInput<typeof CreateReceipt>;
export type CreateReceiptOutput = InferOutput<typeof CreateReceipt>;
export const CreateReceipts = array(CreateReceipt);
export type CreateReceiptsInput = InferInput<typeof CreateReceipts>;
export type CreateReceiptsOutput = InferOutput<typeof CreateReceipts>;
