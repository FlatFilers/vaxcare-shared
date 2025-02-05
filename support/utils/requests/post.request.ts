import { SafeRequest } from "./safe.request";

export abstract class PostRequest<T, P extends Record<string, any>> extends SafeRequest<T> {
  constructor(params: string | string[], payload?: P) {
    super(params, {});
    this.payload = payload;
  }

  async execute(): Promise<T> {
    return this.fetch("POST");
  }
}
