import {
  createRequestHandler,
  RouterContextProvider,
  type ServerBuild,
} from "react-router";
import * as build from "virtual:react-router/server-build";

const handler = createRequestHandler(build as ServerBuild);
export default (req: Request) => handler(req, new RouterContextProvider());
