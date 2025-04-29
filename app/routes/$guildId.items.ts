import { valibotResolver } from "@hookform/resolvers/valibot";
import { data } from "react-router";
import { memberContext } from "./$guildId";
import type { Route } from "./+types/$guildId.items";
import { getValidatedBodyOr400 } from "~/lib/body.server";
import { CreateItem } from "~/lib/schema";
import { Snowflake } from "~/lib/snowflake";
import { prismaContext } from "~/root";

const resolver = valibotResolver(CreateItem);

export async function action({ request, context }: Route.ActionArgs) {
  const prisma = context.get(prismaContext);
  const { guildId, write } = context.get(memberContext);
  if (!write) throw data({ code: "FORBIDDEN", permission: "write" }, 403);

  switch (request.method) {
    case "POST": {
      const body = await getValidatedBodyOr400(request, resolver);

      const id = Snowflake.generate().toString();
      const item = await prisma.item.create({
        data: { id, guildId, ...body },
      });
      return data(item, 201);
    }
    default:
      throw data(null, 405);
  }
}
