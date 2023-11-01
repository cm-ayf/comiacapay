import type { HTTPGraphQLRequest, HTTPGraphQLResponse } from "@apollo/server";
import { HeaderMap } from "@apollo/server";
import { ApolloServer } from "@apollo/server";
import { mergeSchemas } from "@graphql-tools/schema";
import { Context } from "./context";
import { resolvers } from "./resolvers";
import { schema as typeDefs } from "@/generated/graphql";
import schema from "@/schema/scalar.mjs";

export { handler as POST, handler as GET };
async function handler(request: Request) {
  const httpGraphQLRequest: HTTPGraphQLRequest = {
    method: request.method,
    headers: new HeaderMap(request.headers),
    search: new URL(request.url).search,
    body: null,
  };
  if (request.method === "POST") {
    try {
      httpGraphQLRequest.body = await request.json();
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }
  }

  const server = await initApolloServer();
  const response = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest,
    context: Context.init,
  });

  return new Response(toBodyInit(response.body), {
    status: response.status!,
    headers: Array.from(response.headers),
  });
}

declare global {
  var _server: ApolloServer<Context> | Promise<ApolloServer<Context>>;
}

function initApolloServer() {
  if (global._server) return global._server;
  const server = new ApolloServer<Context>({
    logger: console,
    plugins: [Context.authPlugin],
    schema: mergeSchemas({
      schemas: [schema],
      typeDefs,
      resolvers,
    }),
  });
  return (global._server = server.start().then(() => {
    global._server = server;
    return server;
  }));
}

function toBodyInit(body: HTTPGraphQLResponse["body"]): BodyInit {
  switch (body.kind) {
    case "complete":
      return body.string;
    case "chunked":
      return new ReadableStream<string>({
        async pull(controller) {
          const { value, done } = await body.asyncIterator.next();
          if (done) controller.close();
          else controller.enqueue(value);
        },
      });
  }
}
