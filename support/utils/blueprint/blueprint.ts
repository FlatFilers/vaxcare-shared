import api, { Flatfile } from "@flatfile/api";
import { findOrFail } from "../find.or.fail";
import { dedupeFields } from "../sheet.dedupe.fields";
import { KnownWorkbook } from "./known.workbook";

export class Blueprint<T extends Record<any, any>> {
  constructor(public readonly blueprint: Flatfile.CreateWorkbookConfig) {}

  get sheets() {
    return this.blueprint.sheets;
  }

  get uniqueFields() {
    return dedupeFields(
      this.sheets.reduce((acc, sheet) => {
        acc.push(...sheet.fields);
        return acc;
      }, [] as Flatfile.Property[]),
    );
  }

  findFirstField(key: string, asString = false) {
    for (const sheet of this.sheets) {
      for (const field of sheet.fields) {
        if (field.key === key) {
          const res = { ...field };
          if (asString) {
            res.type = "string";
            if ("constraints" in res) {
              delete res.constraints;
            }
            if ("config" in res) {
              delete res.config;
            }
          }
          return res;
        }
      }
    }
    throw new Error("No field in workbook of key: " + key);
  }

  sheet(slug: keyof T) {
    return findOrFail(this.blueprint.sheets, "slug", slug);
  }

  async workbookById(id: string): Promise<KnownWorkbook<T>> {
    const { data: workbook } = await api.workbooks.get(id);
    return new KnownWorkbook(workbook);
  }
}
