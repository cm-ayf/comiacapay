import { valibotResolver } from "@hookform/resolvers/valibot";
import LoadingButton from "@mui/lab/LoadingButton";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData, useRouteError } from "@remix-run/react";
import type { APIRole } from "discord-api-types/v10";
import { useId } from "react";
import { Controller, type Control } from "react-hook-form";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { nullable, object, optional, string } from "valibot";
import type { InferOutput } from "valibot";
import { OAuth2Error } from "~/lib/error";
import { exchangeBotCode } from "~/lib/oauth2guilds.server";
import { initPrisma } from "~/lib/prisma.server";
import { getSession } from "~/lib/session.server";
import { upsertGuildAndMember } from "~/lib/sync.server";

const schema = object({
  readRoleId: optional(nullable(string())),
  writeRoleId: optional(nullable(string())),
  registerRoleId: optional(nullable(string())),
});
type Schema = InferOutput<typeof schema>;
const resolver = valibotResolver(schema);

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) {
      url.pathname = "/";
      return redirect(url.toString());
    }

    const tokenResult = await exchangeBotCode(code);
    const guild = await upsertGuildAndMember(tokenResult);
    return json({ ...guild, roles: tokenResult.guild.roles });
  } catch (e) {
    const error = OAuth2Error.fromError(e);
    return redirect(error.toRedirectLocation());
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  if (!session) throw json(null, 401);

  const url = new URL(request.url);
  const guildId = url.searchParams.get("guild_id");
  if (!guildId) throw json(null, 400);

  const { errors, data } = await getValidatedFormData<Schema>(
    request,
    resolver,
  );
  if (errors) throw json({ errors }, 400);

  const prisma = await initPrisma();
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
  const { name, roles, readRoleId, writeRoleId, registerRoleId } =
    useLoaderData<typeof loader>();

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
  defaultValues: Schema;
}) {
  const { control, handleSubmit, formState } = useRemixForm({
    defaultValues,
    resolver,
  });

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1 }}
    >
      <RoleSelect
        name="read"
        helperText="イベントや商品の情報を閲覧できます"
        control={control}
        roles={roles}
      />

      <RoleSelect
        name="register"
        helperText="レジ入力を行えます"
        control={control}
        roles={roles}
      />

      <RoleSelect
        name="write"
        helperText="イベントや商品の情報を編集できます"
        control={control}
        roles={roles}
      />

      <FormControl>
        <LoadingButton
          type="submit"
          variant="contained"
          color="primary"
          loading={formState.isLoading}
        >
          保存
        </LoadingButton>
      </FormControl>
    </Form>
  );
}

function RoleSelect({
  name,
  helperText,
  control,
  roles,
}: {
  name: "read" | "register" | "write";
  helperText: string;
  control: Control<Schema>;
  roles: APIRole[];
}) {
  const id = useId();
  return (
    <FormControl>
      <InputLabel id={id}>{name.toUpperCase()}</InputLabel>
      <Controller
        control={control}
        name={`${name}RoleId`}
        render={({ field }) => (
          <Select
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value}
            labelId={id}
            inputRef={field.ref}
            label={name.toUpperCase()}
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
        )}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
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
