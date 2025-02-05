import ExtendableError from "extendable-error";
import { SafeRequest } from "./safe.request";

export class RequestError extends ExtendableError {
  public readonly url: URL;
  public readonly body: any;

  constructor(
    public readonly req: SafeRequest<any>,
    public readonly res: Response,
    public readonly raw?: string,
  ) {
    // todo: make a more creative error message
    super("Request failed." + (raw ? " Raw Response: " + raw.substring(0, 2_000) : ""));
    this.url = new URL(req.buildUrl());
  }

  // handle logging the error and incorporating the original stack trace
}
export class RecoverableError extends RequestError {}
export class FatalError extends RequestError {}

/** Recoverable errors **/
export class ServerError extends RecoverableError {}
export class TimeoutError extends RecoverableError {}
export class RateError extends RecoverableError {
  recoverIn(): number {
    // todo: analyze the rate limiting response headers and determine when to retry again
    return 30_000;
  }
}
export class RedirectError extends RecoverableError {
  toUrl() {
    // analyze the response to determine the redirect url
  }
}

/** Unrecoverable errors **/
export class PayloadError extends FatalError {}
export class UnauthorizedError extends FatalError {}
export class NotFoundError extends FatalError {}
export class RetryError extends FatalError {
  constructor(
    public readonly req: SafeRequest<any>,
    public readonly original: RecoverableError,
  ) {
    super(req, original.res);
  }
}
