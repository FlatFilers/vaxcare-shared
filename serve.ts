import FlatfileListener, { EventDriver, EventHandler } from "@flatfile/listener";
import { EventSourcePlus } from "event-source-plus";
import { Debugger } from "@flatfile/utils-debugger";
import cb from "./index";

const listener = FlatfileListener.create(cb);

export class SSEDriver extends EventDriver {
  public events = new Map();
  private eventSource: EventSourcePlus;
  constructor() {
    super();

    const eventSource = new EventSourcePlus(
      `http://localhost:3000/v1/internal/event-stream/environment.${process.env.FLATFILE_ENVIRONMENT_ID}`,
      {
        // automatically retry up to 100 times (default is 'undefined')
        maxRetryCount: 100,
        // set exponential backoff to max out at 10000 ms (default is "30000")
        maxRetryInterval: 10000,
        headers: {
          Authorization: `Bearer ${process.env.FLATFILE_API_KEY}`,
        },
      },
    );
    this.eventSource = eventSource;
  }
  async start() {
    console.log("Starting SSE listener...");
    const controller = this.eventSource.listen({
      onMessage: (event) => {
        const parsedData = JSON.parse(event.data);
        Debugger.logEvent(parsedData);
        this._handler?.dispatchEvent(parsedData);
      },
      onRequest: (request) => {
        console.log("SSE connected: ", request.request);
      },
      onRequestError: (error) => {
        console.error("SSE request error:", error);
        controller.abort();
      },
      onResponseError: (error) => {
        console.error("SSE request error:", error);
        controller.abort();
      },
    });
  }

  mountEventHandler(handler: EventHandler): this {
    handler.setVariables({
      accessToken: process.env.FLATFILE_API_KEY,
      apiUrl: process.env.FLATFILE_API_URL,
    });

    this._handler = handler;
    return this;
  }

  /**
   * Shutdown the pubnub stream
   */
  shutdown() {}
}

const driver = new SSEDriver();
driver.start();
driver.mountEventHandler(listener);
console.log("Listening for events...");
