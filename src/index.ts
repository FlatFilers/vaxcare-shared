import FlatfileListener, { Listener } from "@flatfile/listener";
import { configureSpace } from "@flatfile/plugin-space-configure";
import { ExcelExtractor } from "@flatfile/plugin-xlsx-extractor";
import { instrumentRequests } from "../support/instrument.requests";
import workbook from "./blueprints/workbooks/workbook";
import { bulkRecordHook, FlatfileRecord } from "@flatfile/plugin-record-hook";

instrumentRequests();

export default function (listener: FlatfileListener) {
  listener.on("**", (event) => {
    console.log(`Received event: ${event.topic}`);
  });
  
  listener.use(ExcelExtractor());

  listener.use(
    configureSpace({
      workbooks: [workbook],
    }),
  );

  listener.use(
    bulkRecordHook("patients", (records: FlatfileRecord[]) => {
      records.map((record: FlatfileRecord) => {
        record.compute(
          "email",
          (email, record) => {
            return `${record.get("firstName")}${record.get(
              "lastName"
            )}@gmail.com`;
          },
          // optional
          "Email was generated from first and last name."
        );
        return record;
      });
    })
  );
}
