"use client";

import { useMutation } from "@apollo/client";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { APIGuild, APIRole } from "discord-api-types/v10";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { useAlert } from "../../Alert";
import { assertSuccess } from "../../Apollo";
import UpdateGuildMutation from "./UpdateGuild.graphql";
import type { UpdateGuild } from "@/generated/schema";

export default function RolesSelect({
  guild,
  defaultValues,
}: {
  guild: APIGuild;
  defaultValues: UpdateGuild;
}) {
  const { success, error } = useAlert();
  const router = useRouter();
  const { control, handleSubmit } = useForm<UpdateGuild>({ defaultValues });

  const [trigger, { loading }] = useMutation(UpdateGuildMutation);

  async function onSubmit(input: UpdateGuild) {
    try {
      const result = await trigger({
        variables: { guildId: guild.id, input },
      });
      assertSuccess(result);
      success("サーバー設定を保存しました。");
      router.push(`/guilds/finish?guild_id=${guild.id}`);
    } catch (e) {
      error("サーバー設定の保存に失敗しました。");
      throw e;
    }
  }

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <RoleSelect
        name="read"
        helperText="イベントや商品の情報を閲覧できます"
        control={control}
        roles={guild.roles}
      />

      <RoleSelect
        name="register"
        helperText="レジ入力を行えます"
        control={control}
        roles={guild.roles}
      />

      <RoleSelect
        name="write"
        helperText="イベントや商品の情報を編集できます"
        control={control}
        roles={guild.roles}
      />

      <FormControl>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={loading}
          onClick={handleSubmit(onSubmit)}
        >
          保存
        </LoadingButton>
      </FormControl>
    </Box>
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
  control: Control<UpdateGuild>;
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
            {roles.map(({ id, name, color }) => (
              <MenuItem
                key={id}
                value={id}
                sx={{ color: `#${color.toString(16)}` }}
              >
                {name}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
