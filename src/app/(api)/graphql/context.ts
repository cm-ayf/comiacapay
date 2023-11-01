import type { ApolloServerPlugin, HeaderMap } from "@apollo/server";
import type { PrismaClient, Member } from "@prisma/client";
import { parse } from "cookie";
import { GraphQLError, print, type OperationDefinitionNode } from "graphql";
import type { JWTPayload } from "jose";
import { verifySession } from "../auth/jwt";
import { initPrisma } from "../prisma";

export class Context {
  static async init(): Promise<Context> {
    const prisma = await initPrisma();
    return new Context(prisma);
  }

  static authPlugin: ApolloServerPlugin<Context> = {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, contextValue, operation }) {
          await contextValue.retrieveSession(request.http!.headers);
          if (hasVariableGuildId(operation))
            await contextValue.fetchMember(request.variables!["guildId"]);
        },
      };
    },
  };

  // always set by `retrieveSession` in authPlugin
  session!: Required<JWTPayload>;
  // set by `fetchMember` in authPlugin if `guildId` is provided;
  // asserted non-null for convenience
  member!: Member;

  constructor(public prisma: PrismaClient) {}

  async retrieveSession(headers: HeaderMap) {
    const session =
      sessionFromAuthorization(headers) ?? sessionFromCookie(headers);
    if (!session) {
      throw new GraphQLError("Missing Authorization header or Cookie", {
        extensions: {
          code: "MISSING_AUTHORIZATION",
          http: { status: 401 },
        },
      });
    }
    this.session = await verifySession(session).catch(() => {
      throw new GraphQLError("Invalid Authorization header or Cookie", {
        extensions: {
          code: "INVALID_AUTHORIZATION",
          http: { status: 401 },
        },
      });
    });
  }

  async fetchMember(guildId: string) {
    const member = await this.prisma.member.findUnique({
      where: {
        userId_guildId: { guildId, userId: this.session.sub },
      },
    });
    if (member) {
      this.member = member;
    } else {
      throw new GraphQLError(`You are not a member of guild ${guildId}`, {
        extensions: {
          code: "MEMBER_NOT_FOUND",
          http: { status: 403 },
          guildId,
        },
      });
    }
  }

  assertsPermissions(
    this: { member: Record<Permission, boolean> },
    permissions: Permission[],
  ) {
    if (!permissions.every((permission) => this.member[permission])) {
      throw new GraphQLError(`Missing permissions: ${permissions.join(", ")}`, {
        extensions: {
          code: "MISSING_PERMISSIONS",
          http: { status: 403 },
          permissions,
        },
      });
    }
  }
}

function hasVariableGuildId(operation: OperationDefinitionNode | undefined) {
  const variableDefinition = operation?.variableDefinitions?.find(
    ({ variable }) => variable.name.value === "guildId",
  );
  return !!variableDefinition && print(variableDefinition) === "$guildId: ID!";
}

function sessionFromAuthorization(headers: HeaderMap) {
  const authorization = headers.get("Authorization");
  if (!authorization) return;
  const [type, token] = authorization.split(" ");
  if (type !== "Session") return;
  return token;
}

function sessionFromCookie(headers: HeaderMap) {
  const cookie = headers.get("Cookie");
  if (!cookie) return;
  const { session } = parse(cookie);
  return session;
}

type Permission = "read" | "register" | "write";
