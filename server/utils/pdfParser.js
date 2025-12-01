import fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Parse PDF file and extract text content
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export const parsePdf = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  return data.text;
};

/**
 * Parse PDF from buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text content
 */
export const parsePdfFromBuffer = async (buffer) => {
  const data = await pdf(buffer);
  return data.text;
};


