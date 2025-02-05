import { Flatfile } from "@flatfile/api";
import { GetRecordsRequest } from "../../requests/records.requests";
import { PaginatedCollection } from "../requests/paginated.collection";

export class KnownSheet {
  constructor(public readonly raw: Flatfile.Sheet) {}

  get id() {
    return this.raw.id;
  }

  get slug() {
    return this.raw.slug;
  }

  get name() {
    return this.raw.name;
  }

  get config() {
    return this.raw.config;
  }

  get fields() {
    return this.raw.config.fields;
  }

  getAllRecords() {
    return new PaginatedCollection((pageNumber, pageSize) => new GetRecordsRequest(this.id, { pageNumber, pageSize }), {
      pageSize: 2000,
    });
  }

  keys() {
    return this.fields.map((field) => field.key);
  }
}
