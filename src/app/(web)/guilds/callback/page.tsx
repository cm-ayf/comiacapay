import Typography from "@mui/material/Typography";
import type { RESTOAuth2AdvancedBotAuthorizationQueryResult } from "discord-api-types/v10";
import Navigation from "../../Navigation";
import { exchangeCode } from "../oauth2";
import { upsertGuildAndMember } from "../sync";
import RolesSelect from "./RolesSelect";
import Layout from "@/components/Layout";

export const dynamic = "force-dynamic";

export default async function Roles({
  searchParams: { code },
}: {
  searchParams: RESTOAuth2AdvancedBotAuthorizationQueryResult;
}) {
  const tokenResult = await exchangeCode(code);
  await upsertGuildAndMember(tokenResult);

  return (
    <Layout navigation={<Navigation title="サーバー設定" />}>
      <Typography variant="h3" sx={{ fontSize: "medium" }}>
        {tokenResult.guild.name}の設定
      </Typography>
      <RolesSelect guild={tokenResult.guild} />
    </Layout>
  );
}
