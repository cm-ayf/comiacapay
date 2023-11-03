import { type Static, Type } from "@sinclair/typebox";
import { typeCheck } from "./utils";

const OAuth2ErrorCode = Type.Enum({
  invalid_credentials: "invalid_credentials",
  invalid_request: "invalid_request",
  server_error: "server_error",
});

type OAuth2ErrorCode = Static<typeof OAuth2ErrorCode>;

const OAuth2ErrorJson = Type.Object({
  error: Type.Optional(Type.String()),
  error_description: Type.Optional(Type.String()),
  code: OAuth2ErrorCode,
});

type OAuth2ErrorJson = Static<typeof OAuth2ErrorJson>;

export class OAuth2Error extends Error {
  static fromError(e: unknown, defaultMessage?: string) {
    if (e instanceof this) {
      return e;
    } else {
      const errorMessage = e instanceof Error ? e.message : undefined;
      return new this("server_error", errorMessage || defaultMessage, {
        cause: e,
      });
    }
  }

  static fromSearchParams(searchParams: URLSearchParams) {
    const description = searchParams.get("error_description") ?? undefined;
    const code = searchParams.get("code");
    if (typeCheck(OAuth2ErrorCode, code)) {
      return new this(code, description);
    } else {
      return new this("server_error", description);
    }
  }

  static fromJSON(e: unknown) {
    if (typeCheck(OAuth2ErrorJson, e)) {
      return new this(e.code, e.error_description);
    } else {
      return new this("server_error", undefined, { cause: e });
    }
  }

  constructor(
    public code: OAuth2ErrorCode,
    public description?: string,
    options?: ErrorOptions,
  ) {
    super(description ?? code, options);
  }

  get status() {
    return this.code === "server_error" ? 500 : 400;
  }

  toJSON(): OAuth2ErrorJson {
    const error = {
      invalid_request: "invalid_request",
      invalid_credentials: "invalid_grant",
      server_error: undefined,
    }[this.code];
    return {
      ...(error && { error }),
      ...(this.description && { error_description: this.description }),
      code: this.code,
    };
  }

  toRedirectURL() {
    const error = {
      invalid_request: "invalid_request",
      invalid_credentials: "access_denied",
      server_error: "server_error",
    }[this.code];
    const searchParams = new URLSearchParams({
      error,
      ...(this.description && { error_description: this.description }),
      code: this.code,
    });
    return `/?${searchParams.toString()}`;
  }
}
