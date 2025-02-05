import { safe } from "../requests";
import { KnownWorkbook } from "./blueprint/known.workbook";

export async function getWorkbook(workbookId: string): Promise<KnownWorkbook<any>> {
  const workbook = await safe.workbooks.get(workbookId);
  return new KnownWorkbook(workbook);
}
