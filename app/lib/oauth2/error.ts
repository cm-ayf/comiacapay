import {
  enum_,
  exactOptional,
  object,
  safeParser,
  string,
  type InferOutput,
} from "valibot";

const OAuth2ErrorString = enum_({
  invalid_request: "invalid_request",
  access_denied: "access_denied",
  invalid_grant: "invalid_grant",
  server_error: "server_error",
});
type OAuth2ErrorString = InferOutput<typeof OAuth2ErrorString>;

const OAuth2ErrorJson = object({
  error: OAuth2ErrorString,
  error_description: exactOptional(string()),
});
type OAuth2ErrorJson = InferOutput<typeof OAuth2ErrorJson>;
const parseOAuth2ErrorJson = safeParser(OAuth2ErrorJson);

export class OAuth2Error extends Error {
  static fromError(e: unknown, defaults?: Partial<OAuth2ErrorJson>) {
    if (e instanceof this) {
      if (defaults) Object.assign(e, defaults);
      return e;
    } else {
      const message = e instanceof Error ? e.message : undefined;
      const error = new this("server_error", message, { cause: e });
      return error;
    }
  }

  static fromSearchParams(searchParams: URLSearchParams) {
    const json: { [key: string]: string } = {};
    for (const [key, value] of searchParams) json[key] = value;
    return this.fromJSON(json);
  }

  static fromJSON(e: unknown) {
    const result = parseOAuth2ErrorJson(e);
    if (result.success) {
      const { error, error_description } = result.output;
      return new this(error, error_description);
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

  toJSON() {
    const json: OAuth2ErrorJson = { error: this.error };
    if (this.error_description) json.error_description = this.error_description;
    return json;
  }

  toRedirectLocation(pathname = "/") {
    const searchParams = new URLSearchParams(this.toJSON());
    return `${pathname}?${searchParams}`;
  }
}
