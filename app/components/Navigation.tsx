"use client";

import ArrowBack from "@mui/icons-material/ArrowBack";
import CloudDone from "@mui/icons-material/CloudDone";
import CloudOff from "@mui/icons-material/CloudOff";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import ButtonBase, { type ButtonBaseProps } from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import type { User } from "@prisma/client";
import { useNetworkConnectivity } from "@remix-pwa/client";
import { useLocation, useNavigate } from "@remix-run/react";
import {
  type PropsWithChildren,
  useRef,
  useState,
  useMemo,
  createContext,
} from "react";

export const REPOSITORY: string = "https://github.com/cm-ayf/comiacapay";
export const DOCS = REPOSITORY + "/blob/main/docs";

export interface NavigationContext {
  title?: string | undefined;
  docs?: "register" | "receipts" | "index";
  back?(): void;
}

// stub
function useAlert() {
  return useMemo(() => {
    return {
      success(_: string) {},
      error(_: string) {},
    };
  }, []);
}

const NavigationContext = createContext<NavigationContext>({});

export interface NavigationProps {
  user: User | null;
}

export default function Navigation({ user }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <AppBar position="static" ref={ref} sx={{ height: 48 }}>
      <Toolbar variant="dense">
        <Box sx={{ minWidth: 40 }}>
          <BackButton />
        </Box>
        <Typography component="h1">Comiacapay</Typography>
        <Box sx={{ flex: 1 }} />
        {user ? (
          <UserButton user={user} onClick={() => setOpen(true)} />
        ) : (
          <SigninButton />
        )}
        <ConnectivityStatus />
        <MenuContent
          anchorEl={ref.current}
          open={open}
          onClose={() => setOpen(false)}
        />
      </Toolbar>
    </AppBar>
  );
}

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const back = useMemo(() => {
    const parts = location.pathname.split("/");
    if (parts.length > 2) return parts.slice(0, -1).join("/");
    if (parts[1]) return "/";
    return null;
  }, [location.pathname]);

  if (!back) return null;
  return (
    <IconButton color="inherit" onClick={() => navigate(back)}>
      <ArrowBack />
    </IconButton>
  );
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
      startIcon={<Avatar {...(picture && { src: picture })} />}
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
  const signinUrl = useUrlWithRedirectTo("/auth/signin");
  return (
    <Button color="inherit" href={signinUrl}>
      サインイン
    </Button>
  );
}

function ConnectivityStatus() {
  const connectivity = useNetworkConnectivity();
  return connectivity ? <CloudDone /> : <CloudOff />;
}

function MenuContent(props: Pick<MenuProps, "open" | "anchorEl" | "onClose">) {
  const { success, error } = useAlert();
  const refreshUrl = useUrlWithRedirectTo("/auth/refresh");
  const location = useLocation();
  const docs = useMemo(() => {
    const parts = location.pathname.split("/");
    if (parts.includes("register")) return "register";
    if (parts.includes("receipts")) return "receipts";
    return "index";
  }, [location.pathname]);

  return (
    <Menu
      {...props}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuLinkItem href={refreshUrl}>権限を更新</MenuLinkItem>
      <MenuLinkItem href="/auth/signout">サインアウト</MenuLinkItem>
      <MenuLinkItem href={`${DOCS}/${docs}.md`} target="_blank">
        マニュアル
      </MenuLinkItem>
      <MenuItem
        onClick={() => {
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => success("URLをコピーしました"))
            .catch(() => error("URLをコピーできませんでした"))
            .finally(() => props.onClose?.({}, "escapeKeyDown"));
        }}
      >
        この画面のURLをコピー
      </MenuItem>
    </Menu>
  );
}

function MenuLinkItem({
  children,
  ...props
}: PropsWithChildren<ButtonBaseProps<"a"> & { href: string }>) {
  return (
    <MenuItem sx={{ padding: 0 }}>
      <ButtonBase
        {...props}
        sx={{ px: 2, py: "6px", width: "100%", justifyContent: "left" }}
      >
        {children}
      </ButtonBase>
    </MenuItem>
  );
}

function useUrlWithRedirectTo(base: string) {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams({ redirect_to: location.pathname });
    return `${base}?${params}`;
  }, [base, location]);
}
