import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import type { Route } from "./+types/$guildId.items";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { CreateItem, type CreateItemOutput } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateItem);

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") throw data(null, 405);
  const { userId } = await getSessionOr401(request);
  const { guildId } = params;
  await getMemberOr4xx(userId, guildId, "write");

  switch (request.method) {
    case "POST": {
      const body = await getValidatedBodyOr400<CreateItemOutput>(
        request,
        resolver,
      );

      const id = Snowflake.generate().toString();
      const item = await prisma.item.create({
        data: { id, guildId, ...body },
      });
      return data(item, 201);
    }
  }
}
