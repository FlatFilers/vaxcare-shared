import { Flatfile } from "@flatfile/api";
import { GetRequest } from "../utils/requests/get.request";
import { PatchRequest } from "../utils/requests/patch.request";
import { PostRequest } from "../utils/requests/post.request";

export class AckJobRequest extends PostRequest<Flatfile.Job, Flatfile.JobAckDetails> {
  canMiss = true;
  path = `/v1/jobs/:jobId/ack`;
}

export class CreateJobRequest extends PostRequest<Flatfile.Job, Flatfile.JobConfig> {
  constructor(config: Flatfile.JobConfig) {
    super([], config);
  }
  path = `/v1/jobs`;
}

export class CompleteJobRequest extends PostRequest<Flatfile.Job, Flatfile.JobCompleteDetails> {
  path = `/v1/jobs/:jobId/complete`;
}

export class FailJobRequest extends PostRequest<Flatfile.Job, Flatfile.JobCompleteDetails> {
  path = `/v1/jobs/:jobId/fail`;
}

export class UpdateJobRequest extends PatchRequest<Flatfile.Job, Flatfile.JobAckDetails> {
  path = `/v1/jobs/:jobId`;
}

export class GetJobRequest extends GetRequest<Flatfile.Job> {
  path = `/v1/jobs/:jobId`;
}
