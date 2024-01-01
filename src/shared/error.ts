import { host } from "./host";

type OAuth2ErrorString =
  | "invalid_request"
  | "access_denied"
  | "invalid_grant"
  | "server_error";

function isOAuth2ErrorString(error: unknown): error is OAuth2ErrorString {
  return (
    typeof error === "string" &&
    [
      "invalid_request",
      "invalid_credentials",
      "invalid_grant",
      "server_error",
    ].includes(error)
  );
}

interface OAuth2ErrorJson {
  error: OAuth2ErrorString;
  error_description?: string;
}

function isOAuth2ErrorJson(error: unknown): error is OAuth2ErrorJson {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    isOAuth2ErrorString(error.error) &&
    (!("error_description" in error) ||
      typeof error.error_description === "string")
  );
}

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
    const error = searchParams.get("error");
    const description = searchParams.get("error_description") ?? undefined;
    if (isOAuth2ErrorString(error)) {
      return new this(error, description);
    } else {
      return new this("server_error", description);
    }
  }

  static fromJSON(e: unknown) {
    if (isOAuth2ErrorJson(e)) {
      return new this(e.error, e.error_description);
    } else {
      return new this("server_error", String(e), { cause: e });
    }
  }

  constructor(
    public error: OAuth2ErrorString,
    public error_description?: string,
    options?: ErrorOptions,
  ) {
    super(error_description ?? error, options);
  }

  get status() {
    return this.error === "server_error" ? 500 : 400;
  }

  toRedirectURL() {
    const url = new URL("/", host);
    url.searchParams.set("error", this.error);
    if (this.error_description) {
      url.searchParams.set("error_description", this.error_description);
    }
    return url;
  }
}
