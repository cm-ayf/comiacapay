// https://vercel.com/docs/frameworks/remix#using-a-custom-app/entry.server-file
import { RemixServer } from "@remix-run/react";
import { handleRequest, type EntryContext } from "@vercel/remix";

export default async function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const remixServer = <RemixServer context={remixContext} url={request.url} />;
  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixServer,
  );
}
