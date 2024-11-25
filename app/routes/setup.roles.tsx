import { valibotResolver } from "@hookform/resolvers/valibot";
import LoadingButton from "@mui/lab/LoadingButton";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import { Form, useLoaderData, useRouteError } from "@remix-run/react";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@vercel/remix";
import type { APIRole } from "discord-api-types/v10";
import { useId } from "react";
import {
  RemixFormProvider,
  useRemixForm,
  useRemixFormContext,
} from "remix-hook-form";
import { getValidatedBody } from "~/lib/body.server";
import { exchangeBotCode } from "~/lib/oauth2/setup.server";
import { prisma } from "~/lib/prisma.server";
import {
  UpdateGuild,
  type UpdateGuildInput,
  type UpdateGuildOutput,
} from "~/lib/schema";
import { getSession } from "~/lib/session.server";
import { Snowflake } from "~/lib/snowflake";
import { upsertGuildAndMember } from "~/lib/sync.server";

const resolver = valibotResolver(UpdateGuild);

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) throw redirect("/");

  const tokenResult = await exchangeBotCode(code);
  const guild = await upsertGuildAndMember(tokenResult);
  return json({ guild, roles: tokenResult.guild.roles });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const url = new URL(request.url);
  const guildId = Snowflake.parse(url.searchParams.get("guild_id"))?.toString();
  if (!guildId) throw json(null, 400);

  const { errors, data } = await getValidatedBody<UpdateGuildOutput>(
    request,
    resolver,
  );
  if (errors) throw json({ errors }, 400);

  const member = await prisma.member.findUnique({
    where: {
      userId_guildId: { userId: session.userId, guildId },
    },
  });
  if (!member?.admin) return json(null, 403);

  await prisma.guild.update({
    where: { id: guildId },
    data,
  });

  return redirect(`/${guildId}`);
}

export default function Page() {
  const { guild, roles } = useLoaderData<typeof loader>();
  const { name, readRoleId, writeRoleId, registerRoleId } = guild;

  return (
    <>
      <Typography variant="h3" sx={{ fontSize: "medium" }}>
        {name}の設定
      </Typography>
      <RolesSelect
        roles={roles}
        defaultValues={{ readRoleId, writeRoleId, registerRoleId }}
      />
    </>
  );
}

function RolesSelect({
  roles,
  defaultValues,
}: {
  roles: APIRole[];
  defaultValues: UpdateGuildInput;
}) {
  const {
    handleSubmit,
    reset: _,
    ...methods
  } = useRemixForm({ defaultValues, resolver });

  return (
    <Box
      component={Form}
      method="post"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1 }}
    >
      <RemixFormProvider {...methods} handleSubmit={null} reset={null}>
        <RoleSelect
          name="read"
          helperText="イベントや商品の情報を閲覧できます"
          roles={roles}
        />
        <RoleSelect
          name="register"
          helperText="レジ入力を行えます"
          roles={roles}
        />
        <RoleSelect
          name="write"
          helperText="イベントや商品の情報を編集できます"
          roles={roles}
        />
        <RoleSubmitButton label="保存" />
      </RemixFormProvider>
    </Box>
  );
}

function RoleSelect({
  name,
  helperText,
  roles,
}: {
  name: "read" | "register" | "write";
  helperText: string;
  roles: APIRole[];
}) {
  const id = useId();
  const { register } = useRemixFormContext<UpdateGuildInput>();
  return (
    <FormControl>
      <InputLabel id={id}>{name.toUpperCase()}</InputLabel>
      <Select
        label={name.toUpperCase()}
        labelId={id}
        {...register(`${name}RoleId`)}
      >
        {roles.map(({ id, name, color }) => {
          return (
            <MenuItem
              key={id}
              value={id}
              style={{ color: `#${color.toString(16)}` }}
            >
              {name}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}

function RoleSubmitButton({ label }: { label: string }) {
  const { formState } = useRemixFormContext();
  return (
    <LoadingButton
      type="submit"
      variant="contained"
      color="primary"
      loading={formState.isLoading}
    >
      {label}
    </LoadingButton>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <pre>
      <code>{JSON.stringify(error, null, 2)}</code>
    </pre>
  );
}

export function shouldRevalidate() {
  // code can only be used once
  return false;
}
