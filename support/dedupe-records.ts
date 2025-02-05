import { JobOutcome, SheetConfig } from "@flatfile/api/api";
import { Collection } from "collect.js";
import { safe } from "./requests";
import { Item } from "./requests/records/item";
import { isNullish } from "./utils/is.nullish";
import { SheetJobWorker, TriggeredBy } from "./utils/job.worker";
import { Primitive } from "./utils/records";

@TriggeredBy("dedupe")
export class MergeWorker extends SheetJobWorker {
  async execute(): Promise<void | JobOutcome> {
    const records = await safe.records.stream({ sheetId: this.sheetId });
    const overrideKeys: string | string[] | undefined = "email";

    const sheet = await this.sheet();

    const { duplicateRecords, mergedRecords } = MergeWorker.prepareMerge(sheet.config, records, overrideKeys);

    if (isNullish(duplicateRecords) && isNullish(mergedRecords)) {
      return { message: "No duplicates found" };
    }

    if (records.changes().count() > 0) {
      await safe.records.write({ sheetId: this.sheetId, snapshot: true }, records);
    }

    return {
      message: `Successfully merged ${Math.max(duplicateRecords.length, mergedRecords.length)} records.`,
    };
  }

  public static prepareMerge(
    sheet: SheetConfig,
    records: Collection<Item<any>>,
    overrideKeys?: string | string[] | undefined,
  ) {
    const mergeFieldKeys = sheet.fields.filter((f) => f.metadata?.is_dedupe_field).map((f) => f.key);

    const keys = overrideKeys ? overrideKeys : mergeFieldKeys;

    const { duplicateRecords, mergedRecords } = mergeData(records, keys);
    return { duplicateRecords, mergedRecords };
  }
}

/**
 * Keep the first record encountered based on the specified key.
 * @internal
 */
export function mergeData(records: Collection<Item>, key?: RefType) {
  const uniques = new Map<any, string[]>();
  const result = new Map<Primitive, Item>();
  const deletions: string[] = [];
  const updates = new Set<string>();
  const keys = normalizeFieldRefs(key);
  const conflicts: Item[] = [];

  records.each((record) => {
    const hash = record.hash(...(keys ? keys : record.keys()));

    if (!hash) {
      result.set(record.id, record);
    } else if (uniques.has(hash)) {
      const possibleBases = uniques.get(hash);
      let hasAnyMerge = false;
      for (const id of possibleBases) {
        const baseRecord = result.get(id);
        if (!baseRecord.hasConflict(record)) {
          result.set(id, baseRecord.merge(record));
          deletions.push(record.id);
          record.delete();
          updates.add(id);
          hasAnyMerge = true;
          break;
        }
      }
      if (!hasAnyMerge) {
        result.set(record.id, record);
        uniques.set(hash, [...possibleBases, record.id]);
        conflicts.push(record);
      }
    } else {
      uniques.set(hash, [record.id]);
      result.set(record.id, record);
    }
  });
  return {
    conflictingRecords: conflicts,
    pristineRecords: records.filter((r) => !r.isDirty()).all(),
    duplicateRecords: deletions,
    mergedRecords: Array.from(updates).map((id) => result.get(id)),
    firstRecordOfEachHash: Array.from(uniques).map(([, ids]) => result.get(ids[0])),
  };
}

function normalizeFieldRefs(refs?: RefType): string[] | null {
  if (!refs || refs.length === 0) {
    return null;
  }
  if (typeof refs === "string") {
    return [refs];
  }
  return refs.map((r) => (typeof r === "string" ? r : r.key));
}

type RefType = string | string[] | Array<{ key: string }>;
