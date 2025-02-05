import { Flatfile } from "@flatfile/api";

export function dedupeFields(fields: Flatfile.Property[]): Flatfile.Property[] {
  const keys = new Set<string>();

  return fields
    .reduce((acc, field) => {
      if (!keys.has(field.key)) {
        keys.add(field.key);
        acc.push(field);
      }
      return acc;
    }, [] as Flatfile.Property[])
    .map((f) => {
      if (f.type === "reference") {
        const out = { ...f, type: "string" as any };
        delete out.config;
        return out;
      }
      return { ...f };
    })
    .map((f) => {
      delete f.constraints;
      return f;
    });
}
