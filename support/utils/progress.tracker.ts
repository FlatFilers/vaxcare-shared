import { safe } from "../requests";

export class ProgressTracker {
  public modules: {
    [name: string]: { size: ProgressSize; progress: number; msg?: string };
  } = {};

  public lastMessage?: string;

  constructor(private jobId: string) {}

  /**
   * Add a module to track. This will help ensure the progress is reported correctly
   *
   * @param name
   * @param type
   */
  add(name: string, type: ProgressSize) {
    this.modules[name] = name in this.modules ? this.modules[name] : { size: type, progress: 0 };
    return this;
  }

  /**
   * Report progress of a module
   *
   * @param name
   * @param num
   * @param msg
   */
  async report(name: string, num: number = 100, msg?: string) {
    this.reportQuietly(name, num, msg);
    await this.send();
  }
  /**
   * Report progress of a module without sending it
   *
   * @param name
   * @param num
   * @param msg
   */
  reportQuietly(name: string, num: number = 100, msg?: string) {
    if (!(name in this.modules)) {
      this.add(name, "m");
    }
    msg = msg || name;
    this.modules[name].progress = num;
    this.modules[name].msg = msg;
    this.lastMessage = msg;
  }

  /**
   * Complete the tracked module
   *
   * @param name
   * @param msg
   */
  async complete(name: string, msg?: string) {
    await this.report(name, 100, msg || `Completed ${name}`);
  }

  /**
   * Compute the progress from the modules being tracked
   */
  get status() {
    let total = 0;
    let totalProgress = 0;
    const messages = [];
    for (const [, { size, progress, msg }] of Object.entries(this.modules)) {
      const ratio = size === "s" ? 20 : size === "m" ? 40 : 80;
      total += ratio;
      totalProgress += (progress / 100) * ratio;
      if (progress > 0 && progress < 100 && msg) {
        messages.push(msg);
      }
    }
    return { progress: Math.ceil((totalProgress / total) * 100), messages };
  }

  /**
   * Report the progress to the job
   */
  async send() {
    await safe.jobs.ack(this.jobId, {
      info: this.status.messages.join(" • ") || this.lastMessage || "Processing...",
      progress: this.status.progress,
    });
  }
}

export type ProgressSize = "s" | "m" | "l";
