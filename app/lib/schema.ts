import type { Display, Event, Item } from "@prisma/client";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import {
  boolean,
  custom,
  date,
  literal,
  nonEmpty,
  nullable,
  number,
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

// union of one
export type Discount = SetDiscount;

export interface SetDiscount {
  itemIds: string[];
  amount: number;
}

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

export type ClientDisplay = Jsonify<Display & { item: Item }>;
export const UpsertDisplay = object({
  price: number(),
  internalPrice: nullable(number()),
  dedication: boolean(),
});
export type UpsertDisplayInput = InferInput<typeof UpsertDisplay>;
export type UpsertDisplayOutput = InferOutput<typeof UpsertDisplay>;
