import { Type } from "@sinclair/typebox";
import type { Route } from "./route";
import { Code, Date } from "./common";

export const Record = Type.Object({
  itemcode: Code,
  count: Type.Integer(),
  dedication: Type.Boolean(),
});

export const Receipt = Type.Object({
  id: Type.String(),
  createdAt: Date,
  total: Type.Integer(),
  eventcode: Code,
  records: Type.Array(Record),
});

export const createReceipts = {
  method: "POST",
  path: "/api/events/[eventcode]/receipts",
  params: Type.Object({
    eventcode: Type.String(),
  }),
  body: Type.Array(Receipt),
  response: Type.Array(Receipt),
} satisfies Route;

export const readReceipts = {
  method: "GET",
  path: "/api/events/[eventcode]/receipts",
  params: Type.Object({
    eventcode: Type.String(),
  }),
  response: Type.Array(Receipt),
} satisfies Route;
