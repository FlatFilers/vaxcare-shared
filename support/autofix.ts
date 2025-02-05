import { jobHandler } from "@flatfile/plugin-job-handler";
import { Simplified } from "@flatfile/util-common";
import { asDate } from "./utils/casting";
import api from "@flatfile/api";
import { safe } from "./requests";

export function autoFix(fixups: Record<string, FixUpCallback>) {
  return jobHandler("sheet:auto-fix", async ({ context }, tick) => {
    const { jobId, sheetId } = context;

    const updates = [];

    const records = await Simplified.getAllRecords(sheetId);

    records.forEach((record) => {
      const newRecord: Record<string, any> = { __k: record._id };
      let updateRecord = false;
      // Remove empty lines

      Object.entries(fixups).forEach(([key, callback]) => {
        if (record[key] !== undefined) {
          const newValue = callback(record[key]);
          if (newValue !== record[key]) {
            newRecord[key] = newValue;
            updateRecord = true;
          }
        }
      });

      if (updateRecord) {
        updates.push(newRecord);
      }
    });

    await safe.records.writeRaw({ sheetId, snapshot: true }, updates);
  });
}

// Autofix for date format constraint
export function fixDateFormat(value: string, config: { format: string }): string {
  // Assuming the format is "YYYY-MM-DD" for simplicity. Adjust as needed.
  const date = asDate(value);
  if (!date) {
    return value;
  }
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format for value: ${value}`);
  }
  return date.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
}

type FixUpCallback = (val: any) => any;
