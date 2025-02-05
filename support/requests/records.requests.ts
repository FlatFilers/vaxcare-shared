import { Flatfile } from "@flatfile/api";
import { Collection } from "collect.js";
import jsonlines from "jsonlines";
import { Primitive, SimpleRecord, toSimpleRecord } from "../utils/records";
import { GetRequest } from "../utils/requests/get.request";
import { PostRequest } from "../utils/requests/post.request";
import { Item } from "./records/item";

export class GetRecordsRequest extends GetRequest<SimpleRecord[]> {
  path = "/v1/sheets/:sheetId/records";

  constructor(sheetId: string, opts?: Flatfile.GetRecordsRequest) {
    super(sheetId, opts as any);
  }
  protected async parseBody(body?: Record<string, any>) {
    return (await super.parseBody(body)).records.map(toSimpleRecord);
  }
}
export type StreamRecordsPatchQuery = ({ sheetId: string } | { workbookId: string }) & {
  stream?: boolean;
  truncate?: boolean;
  snapshot?: boolean;
  silent?: boolean;
};
export type StreamRecordsQuery = Flatfile.GetRecordsRequest & {
  sheetId?: string;
  workbookId?: string;
  stream?: boolean;
  includeMetadata?: boolean;
  includeConfig?: boolean;
  includeSheet?: boolean;
  includeSheetSlug?: boolean;
  noContext?: boolean;
};

export class StreamRecordsRequest extends GetRequest<Collection<Item<any>>> {
  path = "/v2-alpha/records.jsonl";
  isRaw = true;
  _headers = { Accept: "application/jsonl" };

  constructor(opts: StreamRecordsQuery = {}) {
    super([], { ...opts, stream: true });
  }
  protected async parseBody(body: any) {
    const lines = await parseJsonLines(body);
    return new Collection(lines.map((r) => new Item<any>(r)));
  }
}

export class SimpleStreamRecordsRequest extends GetRequest<Array<SimpleRecord>> {
  path = "/v2-alpha/records.jsonl";
  isRaw = true;
  _headers = { Accept: "application/jsonl" };

  constructor(opts: StreamRecordsQuery = {}) {
    super([], { ...opts, stream: true });
  }
  protected async parseBody(body: any) {
    const lines = await parseJsonLines(body);
    return lines.map((r) =>
      Object.fromEntries(
        Object.entries(r)
          .map<[string, Primitive]>(([k, v]) => [k === "__k" ? "id" : k === "__m" ? "metadata" : k, v as Primitive])
          .filter(([k]) => !k.startsWith("__")),
      ),
    );
  }
}

export class StreamRecordsUpdate extends PostRequest<{ success: true }, Collection<Item<any>>> {
  path = "/v2-alpha/records.jsonl";
  isRaw = true;
  _headers = { "Content-Type": "application/jsonl" };

  constructor(
    protected opts: StreamRecordsPatchQuery,
    payload: Collection<Item<any>>,
  ) {
    super([], payload);
    this.query = { ...opts, stream: true };
  }

  afterSuccess() {
    const payload = this.payload as Collection<Item<any>>;
    payload.changes().each((r) => r.commit());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async parseBody(_body: any) {
    return {};
  }

  protected serializeBody(records: Collection<Item<any>>) {
    if (this.opts.truncate) {
      return (
        records
          .onlyPresent()
          .map((r) => JSON.stringify(r.toJSON()))
          .join("\n") + "\n"
      );
    } else {
      const updates = records
        // removes any temporary records that have been deleted
        .filter((r) => !(r.id?.startsWith("TEMP_") && r.isDeleted()))
        .changes()
        .map((r) => JSON.stringify(r.changeset()));

      if (!updates.count()) {
        throw new Error("No changes made to this collection that would need to be written.");
      } else {
        return updates.join("\n") + "\n";
      }
    }
  }
}

export class RawRecordsUpsert extends PostRequest<{ success: true }, Array<Record<string, Primitive>>> {
  path = "/v2-alpha/records.jsonl";
  isRaw = true;
  _headers = { "Content-Type": "application/jsonl", "Content-Encoding": "gzip" };

  constructor(
    protected opts: StreamRecordsPatchQuery,
    payload: Array<Record<string, Primitive>>,
  ) {
    super([], payload);
    this.query = { ...opts, stream: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async parseBody(_body: any) {
    return {};
  }

  protected serializeBody(records: Array<Record<string, Primitive>>) {
    return records.map((r) => JSON.stringify(r)).join("\n") + "\n";
  }
}

export class CreateRecordsRequest extends PostRequest<{ commitId?: string; success: boolean }, SimpleRecord[]> {
  path = "/v1/sheets/:sheetId/records";
}

export class GetRecordCountsRequest extends GetRequest<Flatfile.RecordCounts> {
  path = "/v1/sheets/:sheetId/counts";

  constructor(sheetId: string, opts?: Flatfile.GetRecordCountsRequest) {
    super(sheetId, opts as any);
  }

  protected async parseBody(body?: Record<string, any>) {
    return (await super.parseBody(body)).counts;
  }
}

function parseJsonLines(body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parser = jsonlines.parse();

    const out = [];
    parser.on("data", (data) => {
      out.push(data);
    });

    parser.on("end", () => {
      resolve(out);
    });

    parser.on("error", (err) => {
      console.error(err);
      reject(err);
    });

    parser.write(body);
    parser.end();
  });
}
