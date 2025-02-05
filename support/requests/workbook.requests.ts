import { Flatfile } from "@flatfile/api";
import { GetRequest } from "../utils/requests/get.request";
import { PatchRequest } from "../utils/requests/patch.request";
import { PostRequest } from "../utils/requests/post.request";

export class GetWorkbookRequest extends GetRequest<Flatfile.Workbook> {
  path = `/v1/workbooks/:workbookId`;
}
export class ListWorkbooksRequest extends GetRequest<Flatfile.Workbook[]> {
  constructor(opts?: Flatfile.ListWorkbooksRequest) {
    super([], opts as any);
  }
  path = `/v1/workbooks`;
}

export class UpdateWorkbookRequest extends PatchRequest<Flatfile.Workbook, Flatfile.WorkbookUpdate> {
  path = `/v1/workbooks/:workbookId`;
}

export class CreateWorkbookRequest extends PostRequest<Flatfile.Workbook, Flatfile.CreateWorkbookConfig> {
  constructor(config: Flatfile.CreateWorkbookConfig) {
    super([], config);
  }
  path = `/v1/workbooks`;
}
