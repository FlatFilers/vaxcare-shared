import { Flatfile } from "@flatfile/api";
import { asString } from "./casting";

/**
 * { foo: bar } => { foo : {value: bar}}
 * @param obj
 */
export function formatRecord(obj: SimpleRecord): Flatfile.RecordData {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => key !== "id" && key !== "metadata")
      .map(([key, value]) => [key, { value }]),
  );
}

export function toSimpleRecord(r: Flatfile.Record_): SimpleRecord {
  const obj = Object.fromEntries(Object.entries(r.values).map(([key, value]) => [key, value.value] as [string, any]));
  obj.id = r.id;
  return obj as SimpleRecord;
}

export function toSimpleFilteredRecord(r: Flatfile.Record_, keyFilter: string[]): SimpleRecord {
  const obj = Object.fromEntries(
    Object.entries(r.values).reduce((acc, [key, value]) => {
      if (keyFilter && !keyFilter.includes(key)) {
        return acc;
      }

      acc.push([key, value.value] as [string, any]);

      return acc;
    }, []),
  );
  obj.id = r.id;
  return obj as SimpleRecord;
}
export function toNarrowRecord(r: SimpleRecord, keyFilter: string[]): SimpleRecord {
  keyFilter.push("id");
  const obj = Object.fromEntries(
    Object.entries(r).reduce((acc, [key, value]) => {
      if (keyFilter && !keyFilter.includes(key)) {
        return acc;
      }

      acc.push([key, value] as [string, any]);

      return acc;
    }, []),
  );
  obj.id = r.id;
  return obj as SimpleRecord;
}

export type Primitive = string | number | null | boolean;
export type SimpleRecord = Record<string, Primitive>;
export type SafeRecord = Record<string, string | undefined | null>;

export function formatUpdate(obj: SimpleRecord) {
  return {
    id: obj.id as string,
    metadata: obj.metadata as any,
    values: formatRecord(obj),
  };
}

export function patchOneColumn(
  key: string,
  cb: (val: string, record: Record<string, any>, i: number) => string | null,
) {
  return (record: Flatfile.Record_, i: number) => {
    const obj = toSimpleRecord(record);
    return {
      id: record.id,
      values: {
        [key]: { value: cb(asString(obj[key]), obj, i) },
      },
    };
  };
}
