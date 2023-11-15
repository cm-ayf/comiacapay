import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const Env = Type.Object({
  DISCORD_CLIENT_ID: Type.String(),
  DISCORD_CLIENT_SECRET: Type.String(),
  KEY_PAIR: Type.String(),
  DATABASE_URL: Type.String(),
});

const typeCheck = TypeCompiler.Compile(Env);
if (!typeCheck.Check(process.env)) {
  for (const error of typeCheck.Errors(process.env)) {
    console.error(error);
  }
  throw new Error("Invalid environment variables");
}

export const env = process.env;
