import { useEffect, useRef, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { createUseRoute, UnauthorizedError } from "@/lib/swr";
import { readUsersMe, Token } from "@/types/user";
import { useRouter } from "next/router";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CloudOff from "@mui/icons-material/CloudOff";

const useUser = createUseRoute(readUsersMe, {
  refreshInterval: 10000,
  revalidateOnFocus: false,
  onSuccess: ({ exp }) => {
    if (exp - Date.now() / 1000 < 300) {
      fetch("/api/auth/refresh", { method: "POST" });
    }
  },
  onError: (error) => {
    if (error instanceof UnauthorizedError) {
      fetch("/api/auth/refresh", { method: "POST" });
    }
  },
});

export interface NavigationProps {
  bodyTitle: string;
  back?: string;
}

type ConnectionState =
  | { type: "authorized"; user: Token }
  | { type: "unauthorized" }
  | { type: "error" }
  | { type: "loading" };

export default function Navigation({ bodyTitle, back }: NavigationProps) {
  const { data: user, error } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const state: ConnectionState = user
    ? { type: "authorized", user }
    : error
    ? error instanceof UnauthorizedError
      ? { type: "unauthorized" }
      : { type: "error" }
    : { type: "loading" };

  useEffect(() => {
    router.events.on("routeChangeStart", () => setIsLoading(true));
    router.events.on("routeChangeComplete", () => setIsLoading(false));
    return () => {
      router.events.off("routeChangeStart", () => setIsLoading(true));
      router.events.off("routeChangeComplete", () => setIsLoading(false));
    };
  }, [router]);

  return (
    <AppBar position="static" ref={ref}>
      <Toolbar variant="dense">
        {back && (
          <IconButton color="inherit" onClick={() => router.push(back)}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography component="h1">{bodyTitle}</Typography>
        {isLoading && <CircularProgress color="info" />}
        <Box sx={{ flex: 1 }} />
        <MenuButton state={state} setOpen={setOpen} />
        <Menu
          anchorEl={ref.current}
          open={open}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => router.push("/api/auth/signout")}>
            サインアウト
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

function MenuButton({
  state,
  setOpen,
}: {
  state: ConnectionState;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  switch (state.type) {
    case "authorized":
      return (
        <Button
          color="inherit"
          onClick={() => setOpen(true)}
          endIcon={<UserAvatar user={state.user} />}
        >
          <UserButton user={state.user} />
        </Button>
      );
    case "unauthorized":
      return (
        <Button color="inherit" onClick={() => router.push("/api/auth/signin")}>
          サインイン
        </Button>
      );
    case "error":
      return (
        <Button color="inherit" disabled endIcon={<CloudOff />}>
          接続されていません
        </Button>
      );
    case "loading":
      return <Button color="inherit" disabled endIcon={<CircularProgress />} />;
  }
}

function UserAvatar({ user }: { user: Token }) {
  if (!user.avatar) return <Avatar />;

  const url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`;
  return <Avatar src={url} />;
}

function UserButton({ user }: { user: Token }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textTransform: "none",
      }}
    >
      {user.nick ? (
        <>
          <Typography variant="body2" component="span">
            {user.nick}
          </Typography>
          <Typography variant="caption" component="span">
            {user.username}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" component="span">
          {user.username}
        </Typography>
      )}
    </Box>
  );
}
