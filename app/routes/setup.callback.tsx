import { valibotResolver } from "@hookform/resolvers/valibot";
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
import {
  RemixFormProvider,
  useRemixForm,
  useRemixFormContext,
} from "remix-hook-form";
import type { action } from "./$guildId";
import type { Route } from "./+types/setup.callback";
import { useAlert } from "~/components/Alert";
import createErrorBoundary from "~/components/createErrorBoundary";
import { useOnSubmitComplete } from "~/lib/fetcher";
import { exchangeBotCode } from "~/lib/oauth2/setup.server";
import { UpdateGuild, type UpdateGuildInput } from "~/lib/schema";
import { upsertGuildAndMember } from "~/lib/sync/guild.server";
import { sessionContext } from "~/root";

const resolver = valibotResolver(UpdateGuild);

export async function loader({ request, context }: Route.LoaderArgs) {
  try {
    context.get(sessionContext);
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
  defaultValues: UpdateGuildInput;
  submitConfig: SubmitOptions;
}) {
  const fetcher = useFetcher<typeof action>();
  const {
    handleSubmit,
    reset: _,
    ...methods
  } = useRemixForm({ defaultValues, resolver, submitConfig, fetcher });
  const { success } = useAlert();
  const navigate = useNavigate();
  useOnSubmitComplete(fetcher, (data) => {
    success("設定を保存しました");
    navigate(`/${data.id}`);
  });

  return (
    <Box
      component={fetcher.Form}
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
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
    <Button
      type="submit"
      size="large"
      variant="contained"
      color="primary"
      loading={formState.isLoading}
    >
      {label}
    </Button>
  );
}

export const ErrorBoundary = createErrorBoundary();

export function shouldRevalidate() {
  // code can only be used once
  return false;
}
