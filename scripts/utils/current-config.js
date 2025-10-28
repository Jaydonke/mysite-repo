/**
 * 当前配置管理工具
 * 用于在多个配置之间切换
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readConfig, readAllConfigs } from './config-reader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRENT_INDEX_FILE = path.join(__dirname, '../../.current-config-index');

/**
 * 获取当前活动的配置索引
 * @returns {number} - 当前配置索引（1-based）
 */
export function getCurrentIndex() {
  if (fs.existsSync(CURRENT_INDEX_FILE)) {
    const content = fs.readFileSync(CURRENT_INDEX_FILE, 'utf-8').trim();
    const index = parseInt(content, 10);
    return isNaN(index) ? 1 : index;
  }
  return 1; // 默认第一行
}

/**
 * 设置当前活动的配置索引
 * @param {number} index - 配置索引（1-based）
 */
export function setCurrentIndex(index) {
  fs.writeFileSync(CURRENT_INDEX_FILE, index.toString(), 'utf-8');
}

/**
 * 获取当前活动的配置
 * @returns {Object} - 当前配置对象 {theme, domain, siteName}
 */
export function getCurrentConfig() {
  const index = getCurrentIndex();
  return readConfig(index);
}

/**
 * 切换到下一个配置
 * @returns {boolean} - 如果成功切换返回 true，如果已经是最后一个返回 false
 */
export function nextConfig() {
  const allConfigs = readAllConfigs();
  const currentIndex = getCurrentIndex();

  if (currentIndex < allConfigs.length) {
    setCurrentIndex(currentIndex + 1);
    return true;
  }
  return false;
}

/**
 * 重置到第一个配置
 */
export function resetToFirst() {
  setCurrentIndex(1);
}

/**
 * 列出所有配置
 * @returns {Array} - 所有配置，带上当前活动标记
 */
export function listAllConfigs() {
  const allConfigs = readAllConfigs();
  const currentIndex = getCurrentIndex();

  return allConfigs.map((config, i) => ({
    ...config,
    index: i + 1,
    isCurrent: (i + 1) === currentIndex
  }));
}
