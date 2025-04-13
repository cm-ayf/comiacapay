import { valibotResolver } from "@hookform/resolvers/valibot";
import { data, type ActionFunctionArgs } from "react-router";
import {
  getMemberOr4xx,
  getSessionOr401,
  getValidatedBodyOr400,
  parseParamsOr400,
} from "~/lib/middleware.server";
import { prisma } from "~/lib/prisma.server";
import { CreateItem, GuildParams, type CreateItemOutput } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateItem);

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") throw data(null, 405);
  const { userId } = await getSessionOr401(request);
  const { guildId } = parseParamsOr400(GuildParams, params);
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
      return data(item, { status: 201 });
    }
  }
}
