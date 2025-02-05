import { SafeRequest } from "./safe.request";

export abstract class GetRequest<T> extends SafeRequest<T> {
  public retry = true;

  async execute(): Promise<T> {
    return this.get();
  }
}
