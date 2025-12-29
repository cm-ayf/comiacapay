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
import type { BaseIssue, BaseSchema } from "valibot";
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
} from "~/generated/prisma/client";

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
export const UpdateItem = object({
  name: exactOptional(CreateItem.entries.name),
  picture: exactOptional(CreateItem.entries.picture),
  issuedAt: exactOptional(CreateItem.entries.issuedAt),
});

export type ClientEvent = SerializeFrom<Event & { displays: Display[] }>;
export const CreateEvent = object({
  name: pipe(string(), nonEmpty("イベント名を入力してください")),
  date: dateLike(),
  clone: pipe(
    nullable(snowflake()),
    transform((input) => input || null),
  ),
});
export const UpdateEvent = object({
  name: exactOptional(CreateEvent.entries.name),
  date: exactOptional(CreateEvent.entries.date),
});

export const CreateSetDiscount = object({
  __typename: literal("SetDiscount"),
  itemIds: pipe(array(snowflake()), nonEmpty()),
  amount: uint(),
});
export const CreateDiscount = union([CreateSetDiscount]);

export type ClientDisplay = SerializeFrom<Display & { item: Item }>;
export const UpsertDisplay = object({
  price: uint(),
  internalPrice: nullable(uint()),
  dedication: boolean(),
});

export const CreateRecord = object({
  itemId: snowflake(),
  count: uint(),
  internal: boolean(),
  dedication: boolean(),
});
export const CreateReceipt = object({
  id: snowflake(),
  total: uint(),
  records: pipe(array(CreateRecord), nonEmpty()),
});
export const CreateReceipts = array(CreateReceipt);

export type ClientReceipt = SerializeFrom<Receipt & { records: Record[] }>;
