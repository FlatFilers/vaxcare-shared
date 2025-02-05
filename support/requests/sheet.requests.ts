import { Flatfile } from "@flatfile/api";
import { GetRequest } from "../utils/requests/get.request";
import { PostRequest } from "../utils/requests/post.request";

export class GetSheetRequest extends GetRequest<Flatfile.Sheet> {
  path = `/v1/sheets/:sheetId`;
}
export class ValidateSheetRequest extends PostRequest<{ success: true }, never> {
  path = `/v1/sheets/:sheetId/validate`;
}
export class ListSheetsRequest extends GetRequest<Flatfile.Sheet[]> {
  constructor(opts?: Flatfile.ListSheetsRequest) {
    super([], opts as any);
  }
  path = `/v1/sheets`;
}
