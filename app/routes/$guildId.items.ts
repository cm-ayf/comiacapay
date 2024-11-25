import { valibotResolver } from "@hookform/resolvers/valibot";
import { json, type ActionFunctionArgs } from "@vercel/remix";
import { getValidatedBody } from "~/lib/body.server";
import { prisma } from "~/lib/prisma.server";
import { CreateItem, type CreateItemOutput } from "~/lib/schema";
import { getSession } from "~/lib/session.server";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(CreateItem);

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") throw json(null, 405);
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const guildId = Snowflake.parse(params["guildId"])?.toString();
  if (!guildId) throw json(null, 400);

  const member = await prisma.member.findUnique({
    where: {
      userId_guildId: { userId: session.userId, guildId },
    },
  });
  if (!member?.write) throw json(null, 403);

  const { errors, data } = await getValidatedBody<CreateItemOutput>(
    request,
    resolver,
  );
  if (errors) throw json({ errors }, 400);

  const id = Snowflake.generate().toString();
  const item = await prisma.item.create({
    data: { id, guildId, ...data },
  });
  return json(item, 201);
}
