import type { Context } from "../context";
import type { Resolvers } from "@/generated/resolvers";

type ResolversWithContext = Resolvers<Context>;
export type { ResolversWithContext as Resolvers };
