import { createHandler } from "@/lib/handler";
import { verify } from "@/lib/auth";
import { readUsersMe } from "@/types/user";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      await readUsersMeHandler(req, res);
      break;
    case "HEAD":
      res.status(200).end();
      break;
    default:
      res.status(405).end();
      break;
  }
}

const readUsersMeHandler = createHandler(readUsersMe, async (req, res) => {
  const token = verify(req);
  if (!token) {
    res.status(401).end();
    return;
  }

  res.status(200).json(token);
});