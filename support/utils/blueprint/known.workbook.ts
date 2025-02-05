import { Flatfile } from "@flatfile/api";
import { safe } from "../../requests";
import { findOrFail } from "../find.or.fail";
import { KnownSheet } from "./knownSheet";

export class KnownWorkbook<T extends Record<any, any>> {
  constructor(private readonly workbook: Flatfile.Workbook) {}

  get id() {
    return this.workbook.id;
  }

  get sheets() {
    return this.workbook.sheets;
  }

  hasSheet(slugOrId: keyof T) {
    return this.workbook.sheets.some((s) => s.slug === slugOrId || s.id === slugOrId);
  }

  sheet(slug: keyof T) {
    return new KnownSheet(findOrFail(this.workbook.sheets, "slug", slug));
  }

  sheetById(id: string) {
    return new KnownSheet(findOrFail(this.workbook.sheets, "id", id));
  }

  migrateSheet(slug: string, fields: Flatfile.Property[]) {
    const sheet = this.sheet(slug);
    return safe.workbooks.update(this.id, {
      sheets: [
        {
          ...sheet.raw,
          config: {
            ...sheet.raw.config,
            fields,
          },
        },
      ],
    });
  }

  upsertFields(slug: string, fields: Flatfile.Property[], override = false) {
    const sheet = this.sheet(slug);
    const allFields = override ? fields : [...sheet.fields, ...fields];
    const unique = new Map(allFields.map((f) => [f.key, f]));
    return this.migrateSheet(slug, Array.from(unique.values()));
  }
}
