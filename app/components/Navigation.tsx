import CloudDone from "@mui/icons-material/CloudDone";
import CloudOff from "@mui/icons-material/CloudOff";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import type { User } from "@prisma/client";
import { useNetworkConnectivity } from "@remix-pwa/client";
import { type PropsWithChildren, useRef, useState } from "react";
import { useNavigation } from "react-router";
import { useAlert } from "./Alert";
import { LinkComponent, NoDiscoverLinkComponent } from "./LinkComponent";
import { useBreadcrumbs } from "~/lib/handle";
import { useLocationType, useUrlWithRedirectTo } from "~/lib/location";

export const REPOSITORY: string = "https://github.com/cm-ayf/comiacapay";
export const DOCS = REPOSITORY + "/blob/main/docs";

export interface NavigationProps {
  user: User | undefined;
}

export default function Navigation({ user }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <AppBar ref={ref} sx={{ height: 48 }}>
      <Toolbar variant="dense">
        <BreadcrumbsNavigation />
        <Box sx={{ flex: 1 }} />
        <NavigationLoading />
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

function BreadcrumbsNavigation() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <Breadcrumbs sx={{ color: "var(--AppBar-color)" }}>
      {breadcrumbs.map(({ href, label }, index, { length }) =>
        index === length - 1 ? (
          <Typography key={href}>{label}</Typography>
        ) : (
          <ButtonBase
            key={href}
            LinkComponent={NoDiscoverLinkComponent}
            href={href}
          >
            {label}
          </ButtonBase>
        ),
      )}
    </Breadcrumbs>
  );
}

function NavigationLoading() {
  const navigation = useNavigation();

  return (
    navigation.state !== "idle" && (
      <CircularProgress color="secondary" size={32} />
    )
  );
}

function UserButton({ user, onClick }: { user: User; onClick: () => void }) {
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
    <Button
      component={LinkComponent}
      color="inherit"
      href={signinUrl}
      reloadDocument
    >
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
  const signoutUrl = useUrlWithRedirectTo("/auth/signout");
  const locationType = useLocationType();

  return (
    <Menu
      {...props}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuLinkItem href={refreshUrl}>権限を更新</MenuLinkItem>
      <MenuLinkItem href={signoutUrl}>サインアウト</MenuLinkItem>
      <MenuLinkItem href={`${DOCS}/${locationType}.md`} target="_blank">
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
}: PropsWithChildren<{
  href: string;
  target?: string;
}>) {
  return (
    <MenuItem sx={{ p: 0 }}>
      <ButtonBase
        sx={{
          px: "16px",
          py: "6px",
          width: "100%",
          justifyContent: "flex-start",
        }}
        {...props}
      >
        {children}
      </ButtonBase>
    </MenuItem>
  );
}
