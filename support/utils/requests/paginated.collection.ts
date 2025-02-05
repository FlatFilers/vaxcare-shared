import { ProgressTracker } from "../progress.tracker";
import { GetRequest } from "./get.request";

export class PaginatedCollection<T> implements PromiseLike<T[]> {
  /**
   * Default page size of 1000
   * @private
   */
  protected pageSize = 1000;

  /**
   * Register a progress tracker
   * @private
   */
  private _tracker?: ProgressTracker;

  constructor(
    protected factory: (page: number, pageSize: number) => GetRequest<T[]>,
    protected options?: {
      getCounts?: () => GetRequest<number>;
      pageSize?: number;
    },
  ) {
    if (this.options?.pageSize) {
      this.pageSize = this.options.pageSize;
    }
  }

  /**
   * Provide a progress tracking callback
   */
  track(tracker: ProgressTracker) {
    this._tracker = tracker;
  }

  /**
   * Get all pages as fast as the rate limiter allows vs default sequential
   */
  protected _asap = false;
  asap() {
    this._asap = true;
  }

  /**
   * Do something with each record as they're loaded (can help save memory)
   */
  map<K>(cb: (record: T) => K): Promise<K[]> {
    return this.run((records) => {
      return records.map(cb);
    });
  }

  /**
   * Wait for all records (this will pool in memory, be careful)
   */
  all() {
    return this.run();
  }

  private async run(): Promise<T[]>;
  private async run<R>(cb: (records: T[]) => R): Promise<R>;
  private async run<R>(cb?: (records: T[]) => R): Promise<R | T[]> {
    if (this.options?.getCounts) {
      const count = await this.options.getCounts();
      const pages = Math.ceil(count / this.pageSize);
      const promises = Array.from({ length: pages }, (_, i) =>
        this.factory(i + 1, this.pageSize).then((r) => (cb ? cb(r) : r)),
      );
      const results = await Promise.all(promises);
      return results.flat();
    } else {
      const out = [];
      let page = 1;
      while (true) {
        const section = await this.factory(page++, this.pageSize).then((r) => (cb ? cb(r) : r));
        if (!Array.isArray(section)) {
          break;
        }
        out.push(section);

        if (!section?.length || section.length < this.pageSize) {
          break;
        }
      }
      return out.flat();
    }
  }

  /**
   * When awaited, actually run the stuff
   *
   * @param resolve
   * @param reject
   */
  then(resolve: (res: T[]) => any, reject?: (err: any) => any) {
    return this.run().then(resolve, reject);
  }
}
