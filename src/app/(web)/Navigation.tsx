"use client";

import ArrowBack from "@mui/icons-material/ArrowBack";
import CloudOff from "@mui/icons-material/CloudOff";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase, { type ButtonBaseProps } from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { useUserState } from "./UserState";
import { DOCS } from "@/constant";

export interface NavigationProps {
  title?: string | undefined;
  back?: string;
  docs?: "register" | "receipts" | "index";
}

export default function Navigation({
  title,
  back,
  docs = "index",
}: NavigationProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (title) document.title = title + " | Comiacapay";
  }, [title]);

  return (
    <AppBar position="static" ref={ref} sx={{ height: 48 }}>
      <Toolbar variant="dense">
        {back && (
          <IconButton color="inherit" onClick={() => router.push(back)}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography component="h1">{title ?? "Comiacapay"}</Typography>
        <Box sx={{ flex: 1 }} />
        <MenuButton onClick={() => setOpen(true)} />
        <Menu
          anchorEl={ref.current}
          open={open}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuLinkItem href="/api/auth/signout">サインアウト</MenuLinkItem>
          <MenuLinkItem href={`${DOCS}/${docs}.md`} target="_blank">
            マニュアル
          </MenuLinkItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

function MenuButton({ onClick }: { onClick: () => void }) {
  const state = useUserState();

  switch (state.type) {
    case "authorized":
      return <UserButton user={state.user} onClick={onClick} />;
    case "unauthorized":
      return <SigninButton />;
    case "error":
      return <NoConnectionButton />;
    case "loading":
      return <LoadingButton />;
  }
}

function UserButton({
  user,
  onClick,
}: {
  user: { name: string | null; username: string; picture: string | null };
  onClick: () => void;
}) {
  const { name, username, picture } = user;
  return (
    <Button
      color="inherit"
      onClick={onClick}
      endIcon={<Avatar {...(picture && { src: picture })} />}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textTransform: "none",
        }}
      >
        {name ? (
          <>
            <Typography variant="body2" component="span">
              {name}
            </Typography>
            <Typography variant="caption" component="span">
              {username}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" component="span">
            {username}
          </Typography>
        )}
      </Box>
    </Button>
  );
}

function SigninButton() {
  return (
    <Button color="inherit" href="/auth/signin">
      サインイン
    </Button>
  );
}

function NoConnectionButton() {
  return (
    <Button color="inherit" disabled endIcon={<CloudOff />}>
      接続されていません
    </Button>
  );
}

function LoadingButton() {
  return <Button color="inherit" disabled endIcon={<CircularProgress />} />;
}

function MenuLinkItem({
  children,
  sx,
  ...props
}: PropsWithChildren<ButtonBaseProps<"a"> & { href: string }>) {
  return (
    <MenuItem sx={{ padding: 0 }}>
      <ButtonBase
        {...props}
        sx={{ px: 2, py: "6px", width: "100%", justifyContent: "left", ...sx }}
      >
        {children}
      </ButtonBase>
    </MenuItem>
  );
}
