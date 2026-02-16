import CloudDone from "@mui/icons-material/CloudDone";
import CloudOff from "@mui/icons-material/CloudOff";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import { useCallback, useState, useSyncExternalStore } from "react";
import {
  Link,
  useFetcher,
  useNavigation,
  useParams,
  type LinkProps,
} from "react-router";
import { useAlert } from "./Alert";
import { useBreadcrumbs, useTitle, type Breadcrumb } from "~/lib/handle";
import { useLocationType, useUrlWithRedirectTo } from "~/lib/location";
import type { ClientUser } from "~/lib/schema";

export const REPOSITORY: string = "https://github.com/cm-ayf/comiacapay";
export const DOCS = REPOSITORY + "/blob/main/docs";

export interface NavigationProps {
  user: ClientUser | undefined;
}

export default function Navigation({ user }: NavigationProps) {
  const [open, setOpen] = useState<"breadcrumb" | "menu" | false>(false);
  const title = useTitle();
  const breadcrumbs = useBreadcrumbs();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openBreadcrumb = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setOpen("breadcrumb");
  }, []);

  const openMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setOpen("menu");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setAnchorEl(null);
  }, []);

  return (
    <AppBar sx={{ height: 48 }}>
      <Toolbar variant="dense">
        {breadcrumbs.length > 0 ? (
          <IconButton onClick={openBreadcrumb} aria-label="戻る">
            <KeyboardArrowLeftIcon sx={{ color: "var(--AppBar-color)" }} />
          </IconButton>
        ) : (
          <Box sx={{ width: "40px" }} />
        )}
        <Typography variant="h1" sx={{ flex: 1, fontSize: "1em" }}>
          {title}
        </Typography>
        <NavigationLoading />
        {user ? (
          <UserButton user={user} onClick={openMenu} />
        ) : (
          <SigninButton />
        )}
        <ConnectivityStatus />
        <BreadcrumbsContent
          breadcrumbs={breadcrumbs}
          anchorEl={anchorEl}
          open={open === "breadcrumb"}
          onClose={close}
        />
        <MenuContent
          anchorEl={anchorEl}
          open={open === "menu"}
          onClose={close}
        />
      </Toolbar>
    </AppBar>
  );
}

function BreadcrumbsContent({
  open,
  anchorEl,
  onClose,
  breadcrumbs,
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      onClickCapture={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      {breadcrumbs.map(({ href, name }) => (
        <MenuItem key={href} component={ListItemLink} to={href} discover="none">
          {name}
        </MenuItem>
      ))}
    </Menu>
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

function UserButton({
  user,
  onClick,
}: {
  user: ClientUser;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
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
    <Button component={Link} color="inherit" to={signinUrl} reloadDocument>
      サインイン
    </Button>
  );
}

// https://github.com/remix-pwa/monorepo/blob/6fa72a544991a59f8b384a733746a6ec65af75f5/packages/client/hooks/useNetworkConnectivity.ts#L17
function useNetworkConnectivity() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("online", onStoreChange);
      window.addEventListener("offline", onStoreChange);
      return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
      };
    },
    () => navigator.onLine,
    () => false,
  );
}

function ConnectivityStatus() {
  const connectivity = useNetworkConnectivity();
  return connectivity ? <CloudDone /> : <CloudOff />;
}

function MenuContent({
  open,
  anchorEl,
  onClose,
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}) {
  const { success } = useAlert();
  const signoutUrl = useUrlWithRedirectTo("/auth/signout");
  const locationType = useLocationType();
  const refresh = useRefresh();

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      onClickCapture={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={refresh}>権限を更新する</MenuItem>
      <MenuItem
        component={ListItemLink}
        to={signoutUrl}
        discover="none"
        reloadDocument
      >
        サインアウト
      </MenuItem>
      <MenuItem
        component={ListItemLink}
        to={`${DOCS}/${locationType}.md`}
        target="_blank"
      >
        マニュアル
      </MenuItem>
      <MenuItem
        onClick={async () => {
          await navigator.clipboard?.writeText(window.location.href);
          success("URLをコピーしました");
          onClose();
        }}
      >
        この画面のURLをコピー
      </MenuItem>
    </Menu>
  );
}

function useRefresh() {
  const fetcher = useFetcher();
  const { guildId } = useParams();

  return useCallback(() => {
    const action = guildId
      ? `/auth/refresh?guild_id=${guildId}`
      : "/auth/refresh";
    return fetcher.submit(null, { method: "POST", action });
  }, [fetcher, guildId]);
}

function ListItemLink({ role, children, ...props }: LinkProps) {
  return (
    <li role={role}>
      <Link {...props}>{children}</Link>
    </li>
  );
}
