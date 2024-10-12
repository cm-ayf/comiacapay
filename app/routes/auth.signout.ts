import { redirect, type LoaderFunctionArgs } from "@vercel/remix";
import { getCookies, setCookies } from "~/lib/cookie.server";
import { decryptTokenSet } from "~/lib/jwt.server";
import { revokeToken } from "~/lib/oauth2.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookies = await getCookies(request.headers);
  const tokenSet = cookies.token_set;
  if (tokenSet) {
    try {
      const decryptedTokenSet = await decryptTokenSet(tokenSet);
      await revokeToken(decryptedTokenSet.refresh_token);
    } catch {}
  }

  const headers = await setCookies({ session: "", token_set: "" });
  return redirect("/", { headers });
}
