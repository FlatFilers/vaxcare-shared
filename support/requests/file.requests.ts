import { Flatfile } from "@flatfile/api";
import { GetRequest } from "../utils/requests/get.request";
import { PatchRequest } from "../utils/requests/patch.request";

export class GetFileRequest extends GetRequest<Flatfile.File_> {
  path = `/v1/files/:fileId`;
}

export class UpdateFileRequest extends PatchRequest<Flatfile.File_, Flatfile.UpdateFileRequest> {
  path = `/v1/files/:fileId`;

  protected serializeBody(patch: Flatfile.UpdateFileRequest) {
    const prepped: Flatfile.UpdateFileRequest = {};
    if (patch.name) {
      prepped.name = patch.name;
    }
    if (patch.mode) {
      prepped.mode = patch.mode;
    }
    if (patch.status) {
      prepped.status = patch.status;
    }
    if (patch.actions) {
      prepped.actions = patch.actions;
    }
    if (patch.workbookId) {
      prepped.workbookId = patch.workbookId;
    }
    return super.serializeBody(prepped);
  }
}
