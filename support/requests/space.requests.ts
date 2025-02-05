import { Flatfile } from "@flatfile/api";
import { GetRequest } from "../utils/requests/get.request";
import { PatchRequest } from "../utils/requests/patch.request";

export class GetSpaceRequest extends GetRequest<Flatfile.Space> {
  path = `/v1/spaces/:spaceId`;
}
export class ListSpacesRequest extends GetRequest<Flatfile.Space[]> {
  constructor(opts?: Flatfile.ListSpacesRequest) {
    super([], opts as any);
  }
  path = `/v1/spaces`;
}

export class UpdateSpaceRequest extends PatchRequest<Flatfile.Space, Flatfile.SpaceConfig> {
  path = `/v1/spaces/:spaceId`;
}
