import Typography from "@mui/material/Typography";
import type { RESTOAuth2AdvancedBotAuthorizationQueryResult } from "discord-api-types/v10";
import { redirect } from "next/navigation";
import Navigation from "../../Navigation";
import { exchangeCode } from "../oauth2";
import { upsertGuildAndMember } from "../sync";
import RolesSelect from "./RolesSelect";
import Layout from "@/components/Layout";

export default async function Roles({
  searchParams: { code },
}: {
  searchParams: RESTOAuth2AdvancedBotAuthorizationQueryResult;
}) {
  if (!code) return redirect("/");
  const tokenResult = await exchangeCode(code);
  const { readRoleId, writeRoleId, registerRoleId } =
    await upsertGuildAndMember(tokenResult);

  return (
    <Layout navigation={<Navigation title="サーバー設定" />}>
      <Typography variant="h3" sx={{ fontSize: "medium" }}>
        {tokenResult.guild.name}の設定
      </Typography>
      <RolesSelect
        guild={tokenResult.guild}
        defaultValues={{ readRoleId, writeRoleId, registerRoleId }}
      />
    </Layout>
  );
}
