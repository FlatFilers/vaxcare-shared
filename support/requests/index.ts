import { Flatfile } from "@flatfile/api";
import { Collection } from "collect.js";
import { Primitive, SimpleRecord } from "../utils/records";
import { GetFileRequest, UpdateFileRequest } from "./file.requests";
import { AckJobRequest, CompleteJobRequest, CreateJobRequest, FailJobRequest, GetJobRequest } from "./job.requests";
import { Item } from "./records/item";
import {
  CreateRecordsRequest,
  GetRecordCountsRequest,
  GetRecordsRequest,
  RawRecordsUpsert,
  SimpleStreamRecordsRequest,
  StreamRecordsPatchQuery,
  StreamRecordsQuery,
  StreamRecordsRequest,
  StreamRecordsUpdate,
} from "./records.requests";
import { GetSheetRequest, ListSheetsRequest, ValidateSheetRequest } from "./sheet.requests";
import { GetSpaceRequest, ListSpacesRequest, UpdateSpaceRequest } from "./space.requests";
import {
  CreateWorkbookRequest,
  GetWorkbookRequest,
  ListWorkbooksRequest,
  UpdateWorkbookRequest,
} from "./workbook.requests";

export const safe = {
  jobs: {
    ack(jobId: string, options?: { info?: string; progress?: number }) {
      return new AckJobRequest(jobId, options);
    },
    complete(jobId: string, options?: Flatfile.JobCompleteDetails) {
      return new CompleteJobRequest(jobId, options);
    },
    fail(jobId: string, options?: Flatfile.JobCompleteDetails) {
      return new FailJobRequest(jobId, options);
    },
    get(jobId: string) {
      return new GetJobRequest(jobId);
    },
    create(config: Flatfile.JobConfig) {
      return new CreateJobRequest(config);
    },
  },
  files: {
    get(fileId: string) {
      return new GetFileRequest(fileId);
    },
    update(fileId: string, data: Flatfile.UpdateFileRequest) {
      return new UpdateFileRequest(fileId, data);
    },
  },
  workbooks: {
    list(options: Flatfile.ListWorkbooksRequest) {
      return new ListWorkbooksRequest(options);
    },
    get(workbookId: string) {
      return new GetWorkbookRequest(workbookId);
    },
    update(workbookId: string, data: Flatfile.WorkbookUpdate) {
      return new UpdateWorkbookRequest(workbookId, data);
    },
    create(data: Flatfile.CreateWorkbookConfig) {
      return new CreateWorkbookRequest(data);
    },
  },
  spaces: {
    list(options: Flatfile.ListSpacesRequest) {
      return new ListSpacesRequest(options);
    },
    get(spaceId: string) {
      return new GetSpaceRequest(spaceId);
    },
    update(spaceId: string, data: Flatfile.SpaceConfig) {
      return new UpdateSpaceRequest(spaceId, data);
    },
  },
  sheets: {
    list(options: Flatfile.ListSheetsRequest) {
      return new ListSheetsRequest(options);
    },
    get(sheetId: string) {
      return new GetSheetRequest(sheetId);
    },
    validate(sheetId: string) {
      return new ValidateSheetRequest(sheetId);
    },
  },
  records: {
    list(sheetId: string, options?: Flatfile.GetRecordsRequest) {
      return new GetRecordsRequest(sheetId, options);
    },
    stream(options?: StreamRecordsQuery) {
      return new StreamRecordsRequest(options);
    },
    /**
     * This is a temporary shim to support refactoring
     *
     * @deprecated Use `stream` instead
     * @param options
     */
    simpleStream(options?: StreamRecordsQuery) {
      return new SimpleStreamRecordsRequest(options);
    },
    write(options: StreamRecordsPatchQuery, body: Collection<Item<any>>) {
      if (body.changes().count() > 0 || options.truncate) {
        return new StreamRecordsUpdate(options, body);
      }
      return { skipped: true, success: false };
    },
    writeRaw(options: StreamRecordsPatchQuery, body: Array<Record<string, Primitive>>) {
      return new RawRecordsUpsert(options, body);
    },
    counts(sheetId: string, options?: Flatfile.GetRecordCountsRequest) {
      return new GetRecordCountsRequest(sheetId, options);
    },
    createMany(sheetId: string, payload: SimpleRecord[]) {
      return new CreateRecordsRequest(sheetId, payload);
    },
  },
};
