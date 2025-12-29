import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import type { APIRole } from "discord-api-types/v10";
import { useId } from "react";
import {
  redirectDocument,
  useFetcher,
  useLoaderData,
  useNavigate,
  type SubmitOptions,
} from "react-router";
import type { InferInput } from "valibot";
import type { action } from "./$guildId";
import type { Route } from "./+types/setup.callback";
import { useAlert } from "~/components/Alert";
import createErrorBoundary from "~/components/createErrorBoundary";
import { sessionContext } from "~/lib/context.server";
import { useOnSubmitComplete } from "~/lib/fetcher";
import { exchangeBotCode } from "~/lib/oauth2/setup.server";
import { UpdateGuild } from "~/lib/schema";
import { upsertGuildAndMember } from "~/lib/sync/guild.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  try {
    await context.get(sessionContext);
  } catch {
    return redirectDocument("/");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) throw redirectDocument("/");

  const tokenResult = await exchangeBotCode(code);
  const guild = await upsertGuildAndMember(context, tokenResult);
  return { guild, roles: tokenResult.guild.roles };
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
        submitConfig={{
          method: "PATCH",
          action: `/${guild.id}`,
        }}
      />
    </>
  );
}

function RolesSelect({
  roles,
  defaultValues,
  submitConfig,
}: {
  roles: APIRole[];
  defaultValues: InferInput<typeof UpdateGuild>;
  submitConfig: SubmitOptions;
}) {
  const fetcher = useFetcher<typeof action>();
  const [form, fields] = useForm({
    defaultValue: defaultValues,
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: UpdateGuild });
    },
  });
  const { success } = useAlert();
  const navigate = useNavigate();
  useOnSubmitComplete(fetcher, (data) => {
    success("設定を保存しました");
    navigate(`/${data.id}`);
  });

  return (
    <Box
      component={fetcher.Form}
      method={submitConfig.method ?? "POST"}
      action={submitConfig.action ?? ""}
      {...getFormProps(form)}
      sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
    >
      <RoleSelect
        label="READ"
        helperText="イベントや商品の情報を閲覧できます"
        roles={roles}
        field={fields["readRoleId"]}
      />
      <RoleSelect
        label="REGISTER"
        helperText="レジ入力を行えます"
        roles={roles}
        field={fields["registerRoleId"]}
      />
      <RoleSelect
        label="WRITE"
        helperText="イベントや商品の情報を編集できます"
        roles={roles}
        field={fields["writeRoleId"]}
      />
      <RoleSubmitButton state={fetcher.state} />
    </Box>
  );
}

function RoleSelect({
  label,
  helperText,
  roles,
  field,
}: {
  label: string;
  helperText: string;
  roles: APIRole[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
}) {
  const id = useId();
  const inputProps = getInputProps(field, { type: "text" });

  return (
    <FormControl>
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        label={label}
        labelId={id}
        {...inputProps}
        key={inputProps.key}
        name={inputProps.name}
        defaultValue={inputProps.defaultValue ?? ""}
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

function RoleSubmitButton({ state }: { state: string }) {
  return (
    <Button
      type="submit"
      size="large"
      variant="contained"
      color="primary"
      loading={state !== "idle"}
    >
      保存
    </Button>
  );
}

export const ErrorBoundary = createErrorBoundary();

export function shouldRevalidate() {
  // code can only be used once
  return false;
}
