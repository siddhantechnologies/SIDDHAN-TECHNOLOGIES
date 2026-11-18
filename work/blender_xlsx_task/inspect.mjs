import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load("C:/Users/LOVE_BOI/Downloads/qwertyuiop.xlsx"));
const table = await workbook.inspect({ kind: "table", sheetId: "Sheet1", range: "A1:F10", maxChars: 6000, tableMaxRows: 20, tableMaxCols: 8, tableMaxCellChars: 120 });
console.log(table.ndjson);
const preview = await workbook.render({ sheetName: "Sheet1", range: "A1:F10", scale: 2, format: "png" });
await fs.writeFile("D:/Love Boi/Web_1/Web/work/blender_xlsx_task/source_preview.png", new Uint8Array(await preview.arrayBuffer()));
