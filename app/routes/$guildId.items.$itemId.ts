import { valibotResolver } from "@hookform/resolvers/valibot";
import { useFetcher } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@vercel/remix";
import { useCallback } from "react";
import { useRemixForm } from "remix-hook-form";
import { getValidatedBody } from "~/lib/body.server";
import { prisma } from "~/lib/prisma.server";
import { UpdateItem, type UpdateItemOutput } from "~/lib/schema";
import { getSession } from "~/lib/session.server";
import { Snowflake } from "~/lib/snowflake";

const resolver = valibotResolver(UpdateItem);

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const guildId = Snowflake.parse(params["guildId"])?.toString();
  const itemId = Snowflake.parse(params["itemId"])?.toString();
  if (!guildId || !itemId) throw json(null, 400);

  const member = await prisma.member.findUnique({
    where: {
      userId_guildId: { userId: session.userId, guildId },
    },
  });
  if (!member?.write) throw json(null, 403);

  switch (request.method) {
    case "PATCH": {
      const { errors, data } = await getValidatedBody<UpdateItemOutput>(
        request,
        resolver,
      );
      if (errors) throw json({ errors }, 400);

      const item = await prisma.item.update({
        where: { id: itemId, guildId },
        data,
      });
      return json(item);
    }
    case "DELETE": {
      const item = await prisma.item.delete({
        where: { id: itemId, guildId },
      });
      return json(item);
    }
    default:
      throw json(null, 405);
  }
}

export function useUpdateItemForm(
  guildId: string,
  itemId: string,
  defaultValues: UpdateItemOutput,
) {
  return useRemixForm<UpdateItemOutput>({
    resolver,
    defaultValues,
    submitConfig: {
      method: "PATCH",
      action: `/${guildId}/items/${itemId}`,
    },
  });
}

export function useDeleteItemFetcher(guildId: string, itemId: string) {
  const fetcher = useFetcher();
  return {
    handleSubmit: useCallback(() => {
      fetcher.submit(null, {
        method: "DELETE",
        action: `/${guildId}/items/${itemId}`,
      });
    }, [fetcher, guildId, itemId]),
    formState: { isLoading: fetcher.state !== "idle" },
  };
}
