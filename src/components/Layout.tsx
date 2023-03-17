import Head from "next/head";
import { Box, Container, ContainerProps } from "@mui/material";
import Navigation from "./Navigation";
import type { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{
  headTitle: string;
  bodyTitle: string;
  containerProps?: Omit<ContainerProps, "children">;
  bottom?: React.ReactNode;
}>;

const Layout: React.FC<LayoutProps> = ({ children, ...props }) => (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <Head>
      <title>{props.headTitle}</title>
    </Head>
    <Navigation title={props.bodyTitle} />
    <Container
      {...props.containerProps}
      sx={{
        flex: "auto",
        overflowY: "auto",
        py: 2,
        ...props.containerProps?.sx,
      }}
    >
      {children}
    </Container>
    {props.bottom}
  </Box>
);

export default Layout;