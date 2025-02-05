import { asyncSleep } from "modern-async";
import {
  FatalError,
  NotFoundError,
  PayloadError,
  RateError,
  RecoverableError,
  RedirectError,
  RetryError,
  ServerError,
  TimeoutError,
  UnauthorizedError,
} from "./request.errors";

export abstract class SafeRequest<T> implements PromiseLike<T> {
  abstract readonly path: string;
  protected payload?: Record<string, any>;

  constructor(
    public params: string | string[],
    public query?: Record<string, ValidQuery>,
  ) {}
  /**
   * Control the max number of retries
   */
  public maxAttempts = 5;

  public timeoutDelay = 500;

  /**
   * prefix url with the API base if this is true
   */
  public isApiRequest = true;

  /**
   * This request can fail safely in the event of an error or rate limit hit
   * and doesn't need to be retried. Useful for things like progress reporting.
   *
   * @default false
   */
  public canMiss = false;

  /**
   * This request can be safely retried
   * @default false
   */
  public retry = false;

  /**
   * Cache the successful results of this request for a period of time
   * @default no caching
   */
  public cache?: number;

  public isRaw = false;

  private attempts: number = 0;
  private nextAttemptDelay: number = 0;
  private _isRun = false;

  protected abstract execute(): Promise<T>;

  protected _headers: Record<string, string> = {};
  public setHeaders(headers: Record<string, string>) {
    this._headers = { ...this._headers, ...headers };
    return this;
  }
  protected post() {
    return this.fetch("POST");
  }

  protected get() {
    return this.fetch("GET");
  }

  protected async fetch(method: HttpMethods): Promise<T> {
    const headers = {
      Authorization: `Bearer ${process.env.FLATFILE_API_KEY || process.env.FLATFILE_BEARER_TOKEN}`,
    };
    if (!this.isRaw) {
      headers["Content-Type"] = "application/json";
    }
    if (this._headers) {
      Object.entries(this._headers).forEach(([key, value]) => {
        headers[key] = value;
      });
    }

    const body = this.payload ? await this.serializeBody(this.payload) : undefined;

    const res = await fetch(this.buildUrl(), {
      method,
      headers,
      body,
    });

    await this.handleResponseCodes(res as any);
    this.afterSuccess();

    try {
      const parsed = !this.isRaw ? await res.json() : await res.text();
      return this.parseBody(parsed);
    } catch (e) {
      // handle invalid response
    }

    return Promise.resolve(undefined);
  }

  protected async parseBody(body?: Record<string, any>) {
    if (!body) {
      return undefined;
    }
    if ("data" in body) {
      return body.data;
    }
    return body;
  }

  protected afterSuccess() {}

  protected serializeBody(input?: any): string | Uint8Array | Promise<string | Uint8Array> {
    return JSON.stringify(input);
  }

  protected async handleResponseCodes(res: Response): Promise<true> {
    let rawText = "";
    if (res.status >= 300) {
      try {
        rawText = await res.text();
      } catch (e) {
        //   this isn't criticla
      }
    }
    if ([500, 502, 503].includes(res.status)) {
      throw new ServerError(this, res, rawText);
    }

    if ([504, 408].includes(res.status)) {
      throw new TimeoutError(this, res, rawText);
    }

    if (res.status === 429) {
      throw new RateError(this, res, rawText);
    }

    if (res.status === 400) {
      throw new PayloadError(this, res, rawText);
    }

    if (res.status === 404) {
      throw new NotFoundError(this, res, rawText);
    }

    if ([401, 403].includes(res.status)) {
      throw new UnauthorizedError(this, res, rawText);
    }

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      throw new RedirectError(this, res, rawText);
    }

    //  allow not modified as non error
    if (res.status === 304) {
      return true;
    }

    // all other statuses
    if (res.status >= 300) {
      throw new FatalError(this, res, rawText);
    }

    return true;
  }

  private async _run() {
    try {
      if (this.nextAttemptDelay) {
        await asyncSleep(this.nextAttemptDelay);
      }
      this.attempts++;
      this.nextAttemptDelay = this.nextAttemptDelay ? this.nextAttemptDelay * 2 : this.timeoutDelay;
      return await this.execute();
    } catch (e) {
      if (e instanceof RecoverableError && this.retry) {
        if (this.attempts < this.maxAttempts) {
          return this._run();
        } else {
          throw new RetryError(this, e);
        }
      }
      throw e;
    }
  }

  async run() {
    if (this._isRun) {
      throw new Error("You cannot execute the same request instance twice.");
    }

    this._isRun = true;

    return this._run();
  }

  defaultQuery(): Record<string, ValidQuery> {
    return {};
  }

  buildQuery(): URLSearchParams {
    const query = this.query ? { ...this.defaultQuery(), ...this.query } : this.defaultQuery();
    const queryParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.map((v) => queryParams.append(key, String(v)));
        } else {
          queryParams.set(key, String(value));
        }
      }
    });
    return queryParams;
  }

  /**
   * @todo handle mismatched params
   */
  public buildPath() {
    const params = Array.isArray(this.params) ? [...this.params] : this.params.split("/");
    const basePath = this.path.split("/").map((seg) => (seg.startsWith(":") ? params.shift() : seg));
    return basePath.join("/");
  }

  public buildUrl() {
    const apiBase = process.env.FLATFILE_API_URL || process.env.AGENT_INTERNAL_URL;

    const query = this.buildQuery().toString();
    const path = this.buildPath();
    return `${this.isApiRequest ? apiBase : ""}${path}${query ? `?${query}` : ""}`;
  }

  then(resolve: (val: T) => any, reject?: (err: any) => any) {
    return this.run().then(resolve, reject);
  }
}

export interface Revertable {
  revertEffects(): Promise<boolean>;
}

export interface Verifiable {
  verifyEffects(): Promise<boolean>;
}

export type HttpMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ValidQuery = number | boolean | string | string[];

process.on("uncaughtException", function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});
