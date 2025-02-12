import { Flatfile } from "@flatfile/api";
import { patients } from "../sheets/sheet";

const workbook: Flatfile.CreateWorkbookConfig = {
  name: "VaxCare",
  labels: ["pinned"],
  sheets: [patients],
};

export default workbook;
