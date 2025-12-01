import xlsx from 'xlsx';

/**
 * Parse Excel/Spreadsheet file and convert to text
 * @param {string} filePath - Path to Excel file
 * @param {number} sheetIndex - Index of sheet to parse (default: 0)
 * @returns {string} - Converted text content
 */
export const parseExcel = (filePath, sheetIndex = 0) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return rows.map((r) => r.join(',')).join('\n');
};

/**
 * Parse Excel from buffer
 * @param {Buffer} buffer - Excel file buffer
 * @param {number} sheetIndex - Index of sheet to parse (default: 0)
 * @returns {string} - Converted text content
 */
export const parseExcelFromBuffer = (buffer, sheetIndex = 0) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return rows.map((r) => r.join(',')).join('\n');
};

/**
 * Parse Excel and return structured JSON
 * @param {string} filePath - Path to Excel file
 * @param {number} sheetIndex - Index of sheet to parse (default: 0)
 * @returns {Array} - Array of objects representing rows
 */
export const parseExcelToJson = (filePath, sheetIndex = 0) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};


