import { Flatfile } from "@flatfile/api";
import { FlatfileEvent, FlatfileListener } from "@flatfile/listener";
import ExtendableError from "extendable-error";
import { safe } from "../requests";
import { KnownSheet } from "./blueprint/knownSheet";
import { getWorkbook } from "./get.workbook";
import { ProgressSize, ProgressTracker } from "./progress.tracker";

export class JobWorker {
  public readonly progress: ProgressTracker;
  constructor(
    protected event: FlatfileEvent,
    protected job: Flatfile.Job,
  ) {
    this.progress = new ProgressTracker(event.context.jobId);
    if ((this.constructor as any)._initiators) {
      for (const method of (this.constructor as any)._initiators) {
        method.apply(this, this);
      }
    }
  }

  async execute(): Promise<void | Flatfile.JobOutcome> {}

  get id() {
    return this.job.id;
  }

  get input() {
    return this.job.input || {};
  }

  get context() {
    return this.event.context;
  }

  get accountId(): string {
    return this.event.context.accountId;
  }

  get environmentId(): string {
    return this.event.context.environmentId;
  }

  get spaceId(): string {
    return this.event.context.spaceId;
  }

  async onError(_e: any): Promise<void> {
    // do nothing by default
  }
}

export class WorkbookJobWorker extends JobWorker {
  get workbookId(): string {
    if (!this.event.context.workbookId) throw new Error("Workbook ID not found");
    return this.event.context.workbookId;
  }

  async workbook() {
    return getWorkbook(this.workbookId);
  }
}

export class SheetJobWorker extends WorkbookJobWorker {
  get sheetId(): string {
    if (!this.event.context.sheetId) throw new Error("Sheet ID not found");
    return this.event.context.sheetId;
  }

  async sheet(): Promise<KnownSheet> {
    const sheet = await safe.sheets.get(this.sheetId);
    return new KnownSheet(sheet);
  }
}

export class ColumnJobWorker extends SheetJobWorker {
  get subject() {
    return this.job.subject as Flatfile.JobSubject.Collection;
  }
  get columnKey() {
    if (this.subject.params?.columnKey) {
      return this.subject.params.columnKey;
    }
    throw new Error("No columnKey available in a column job");
  }
}

export function worker(Worker: typeof JobWorker) {
  // @ts-ignore
  const actions: string[] = Worker.__actionsHandled;
  if (!actions) {
    throw new Error("You must add the @TriggeredBy(action) decorator to your worker definition.");
  }
  return (listener: FlatfileListener) => {
    actions.forEach((action) => {
      listener.on("job:ready", { job: action }, async (event: FlatfileEvent) => {
        const jobId = event.context.jobId;
        const job = await safe.jobs.ack(jobId);
        const jobInstance = new Worker(event, job);
        try {
          const res = await jobInstance.execute();
          await safe.jobs.complete(jobId, res ? { outcome: res } : {});
        } catch (e) {
          try {
            await jobInstance.onError(e);
          } catch (e) {
            console.trace(e);
          }

          if (e instanceof JobError) {
            await safe.jobs.fail(job.id, {
              outcome: e.outcome,
            });
          } else {
            console.trace(e);
            await safe.jobs.fail(job.id, {
              outcome: {
                acknowledge: true,
                heading: "Error",
                message: String(e),
              },
            });
          }
        }
      });
    });
  };
}

export class JobError extends ExtendableError {
  public readonly outcome: Flatfile.JobOutcome;
  constructor(message: string | Flatfile.JobOutcome) {
    if (typeof message === "string") {
      super(message);
      this.outcome = { message, heading: "Error", acknowledge: true };
    } else {
      super(message.message);
      this.outcome = message;
    }
  }
}

export function TrackProgress(group: string, size: ProgressSize = "s", message?: string) {
  return function (target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    if (!target.constructor._initiators) {
      target.constructor._initiators = [];
    }
    target.constructor._initiators.push(function () {
      this.progress.add(group, size);
    });

    descriptor.value = async function (...args: any[]) {
      await this.progress.report(group, 5, message);
      const res = await originalMethod.apply(this, args);
      this.progress.reportQuietly(group, 100, message);
      return res;
    };

    return descriptor;
  };
}
export function TriggeredBy(operation: string, scope: string = "*") {
  return function (target: any) {
    target.__actionsHandled ??= [];
    target.__actionsHandled.push(`${scope}:${operation}`);
  };
}
