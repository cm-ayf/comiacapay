import type { ApolloError } from "@apollo/client";
import type { User } from "@/generated/schema";
import { OAuth2Error } from "@/shared/error";

export type PartialUser = Pick<User, "id" | "name" | "username" | "picture">;

export type UserState =
  | { type: "authorized"; user: PartialUser }
  | { type: "error"; user?: PartialUser }
  | { type: "unauthorized" | "loading"; user?: never };

export class UserStateController extends EventTarget {
  state: UserState = { type: "loading" };

  constructor() {
    super();

    this.addEventListener("QuerySuccess", (e) => {
      this.state = { type: "authorized", user: e.user };
      this.dispatchEvent(new StateChangeEvent(this.state));
    });
    this.addEventListener("QueryUnauthorized", () => {
      this.triggerRefresh();
    });
    this.addEventListener("QueryError", () => {
      this.state = { ...this.state, type: "error" };
      this.dispatchEvent(new StateChangeEvent(this.state));
    });

    this.addEventListener("RefreshSuccess", (e) => {
      this.state = { type: "authorized", user: e.user };
      this.dispatchEvent(new StateChangeEvent(this.state));
    });
    this.addEventListener("RefreshUnauthorized", () => {
      this.state = { type: "unauthorized" };
      this.dispatchEvent(new StateChangeEvent(this.state));
    });
    this.addEventListener("RefreshError", () => {
      this.state = { ...this.state, type: "error" };
      this.dispatchEvent(new StateChangeEvent(this.state));
    });

    this.addEventListener("RedirectUnauthorized", () => {
      this.state = { type: "unauthorized" };
      this.dispatchEvent(new StateChangeEvent(this.state));
    });
    this.addEventListener("RedirectError", () => {
      this.state = { ...this.state, type: "error" };
      this.dispatchEvent(new StateChangeEvent(this.state));
    });
  }

  checkUrl() {
    const url = new URL(location.href);
    if (!url?.searchParams.get("error")) return;

    const e = OAuth2Error.fromSearchParams(url.searchParams);
    this.dispatchEvent(new RedirectErrorEvent(e));
  }

  async waitUntilAuthorized() {
    switch (this.state.type) {
      case "unauthorized":
      case "error":
        return false;
      // @ts-expect-error ts7029 intended fallthrough
      case "authorized":
        this.triggerRefresh();
      case "loading":
        return this.waitUntilRefreshEnd();
    }
  }

  private async triggerRefresh() {
    try {
      const res = await fetch("/auth/refresh", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        this.dispatchEvent(new RefreshSuccessEvent(json));
      } else {
        throw OAuth2Error.fromJSON(json);
      }
    } catch (error) {
      const e = OAuth2Error.fromError(error);
      if (e.code === "server_error")
        this.dispatchEvent(new RefreshErrorEvent(e));
      else this.dispatchEvent(new RefreshUnauthorizedEvent(e));
    }
  }

  private async waitUntilRefreshEnd() {
    return new Promise<boolean>((resolve) => {
      const listener = (e: UserStateContextEvent) => {
        resolve(e instanceof RefreshSuccessEvent);
        this.removeEventListener("RefreshSuccess", listener);
        this.removeEventListener("RefreshUnauthorized", listener);
        this.removeEventListener("RefreshError", listener);
      };
      this.addEventListener("RefreshSuccess", listener);
      this.addEventListener("RefreshUnauthorized", listener);
      this.addEventListener("RefreshError", listener);
    });
  }
}

type Listener<E extends Event> =
  | ((ev: E) => any)
  | { handleEvent(ev: E): any }
  | null;

export interface UserStateController {
  addEventListener<K extends keyof UserStateControllerEventMap>(
    type: K,
    listener: Listener<UserStateControllerEventMap[K]>,
  ): void;
  removeEventListener<K extends keyof UserStateControllerEventMap>(
    type: K,
    listener: Listener<UserStateControllerEventMap[K]>,
  ): void;
  dispatchEvent(event: UserStateContextEvent): boolean;
}

type UserStateContextEvent =
  UserStateControllerEventMap[keyof UserStateControllerEventMap];

interface UserStateControllerEventMap {
  StateChange: StateChangeEvent;
  QuerySuccess: QuerySuccessEvent;
  QueryUnauthorized: QueryUnauthorizedEvent;
  QueryError: QueryErrorEvent;
  RefreshSuccess: RefreshSuccessEvent;
  RefreshUnauthorized: RefreshUnauthorizedEvent;
  RefreshError: RefreshErrorEvent;
  RedirectUnauthorized: RedirectUnauthorizedEvent;
  RedirectError: RedirectErrorEvent;
}

export class StateChangeEvent extends Event {
  constructor(public state: UserState) {
    super("StateChange");
  }
}

export class QuerySuccessEvent extends Event {
  constructor(public user: PartialUser) {
    super("QuerySuccess");
  }
}

export class QueryUnauthorizedEvent extends Event {
  constructor(public error: ApolloError) {
    super("QueryUnauthorized");
  }
}

export class QueryErrorEvent extends Event {
  constructor(public error: ApolloError) {
    super("QueryError");
  }
}

export class RefreshSuccessEvent extends Event {
  constructor(public user: PartialUser) {
    super("RefreshSuccess");
  }
}

export class RefreshUnauthorizedEvent extends Event {
  constructor(public error: OAuth2Error) {
    super("RefreshUnauthorized");
  }
}

export class RefreshErrorEvent extends Event {
  constructor(public error: OAuth2Error) {
    super("RefreshError");
  }
}

export class RedirectUnauthorizedEvent extends Event {
  constructor(public error: OAuth2Error) {
    super("RedirectUnauthorized");
  }
}

export class RedirectErrorEvent extends Event {
  constructor(public error: OAuth2Error) {
    super("RedirectError");
  }
}
