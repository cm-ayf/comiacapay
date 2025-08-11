import { handleRequest } from "@vercel/react-router/entry.server";
import { unstable_RouterContextProvider } from "react-router";

export default handleRequest;

export function getLoadContext() {
  return new unstable_RouterContextProvider();
}
