/**
 * 配置文件读取工具
 * 支持读取 config.csv 文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 读取 config.csv 文件的单行配置
 * @param {number} rowIndex - 行索引（从0开始，0是标题行，1是第一行数据）
 * @returns {Object} - 包含 theme, domain, siteName 的对象
 */
export function readConfig(rowIndex = 1) {
  const configPath = path.join(__dirname, '../../config.csv');

  if (!fs.existsSync(configPath)) {
    throw new Error('config.csv file not found');
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('config.csv must have at least a header row and one data row');
  }

  if (rowIndex >= lines.length) {
    throw new Error(`Row index ${rowIndex} out of bounds. CSV has ${lines.length} lines.`);
  }

  const dataLine = lines[rowIndex].split(',');

  if (dataLine.length < 3) {
    throw new Error('Each row in config.csv must have at least 3 columns: theme, domain, siteName');
  }

  return {
    theme: dataLine[0].trim(),
    domain: dataLine[1].trim(),
    siteName: dataLine[2].trim()
  };
}

/**
 * 读取 config.csv 文件的所有数据行
 * @returns {Array} - 包含所有配置对象的数组
 */
export function readAllConfigs() {
  const configPath = path.join(__dirname, '../../config.csv');

  if (!fs.existsSync(configPath)) {
    throw new Error('config.csv file not found');
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    return [];
  }

  // 跳过标题行
  const configs = [];
  for (let i = 1; i < lines.length; i++) {
    const dataLine = lines[i].split(',');
    if (dataLine.length >= 3) {
      configs.push({
        theme: dataLine[0].trim(),
        domain: dataLine[1].trim(),
        siteName: dataLine[2].trim()
      });
    }
  }

  return configs;
}

/**
 * 获取配置文件中的数据行数量（不包括标题行）
 * @returns {number}
 */
export function getConfigCount() {
  const configPath = path.join(__dirname, '../../config.csv');

  if (!fs.existsSync(configPath)) {
    return 0;
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());

  return Math.max(0, lines.length - 1); // 减去标题行
}
