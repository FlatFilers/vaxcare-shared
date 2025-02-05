import { FlatfileListener } from "@flatfile/listener";

export function demo(customer: string, cb: (listener: FlatfileListener) => void) {
  return function (listener: FlatfileListener) {
    listener.on("cron:5-minutes", async (event) => {
      console.log("✓ Running 5m cron job", event.context);
    });

    listener.namespace(`space:${customer}`, (ns) => {
      cb(ns);
    });
  };
}
