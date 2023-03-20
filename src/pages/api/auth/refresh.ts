import {
  client,
  clearCredentials,
  scope,
  setCredentials,
  createCredentials,
  redirectError,
} from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "HEAD":
      res.status(200).end();
      break;
    case "GET":
    case "POST":
      break;
    default:
      res.status(405).end();
  }

  const { refresh_token: refreshToken } = req.cookies;
  if (!refreshToken) {
    clearCredentials(res);
    res.status(400).end();
    return;
  }

  const response = await client.tokenRequest({
    scope,
    grantType: "refresh_token",
    refreshToken,
  });

  try {
    const credentials = await createCredentials(response);
    setCredentials(res, credentials);
    switch (req.method) {
      case "GET":
        res.redirect("/");
        break;
      case "POST":
        res.status(200).end();
        break;
    }
  } catch (error) {
    clearCredentials(res);
    redirectError(res, error);
  }
}