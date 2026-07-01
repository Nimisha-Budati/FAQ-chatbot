import fs from 'fs/promises';
import path from 'path';
export const readJsonFile = async (filePath, defaultValue = []) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJsonFile(filePath, defaultValue);
      return defaultValue;
    }
    throw error;
  }
};
export const writeJsonFile = async (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing file at ${filePath}:`, error);
    throw error;
  }
};