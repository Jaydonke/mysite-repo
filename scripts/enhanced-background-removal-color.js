/**
 * 增强的背景移除算法 - 彩色背景版本
 * 专门优化用于移除任何单色背景（包括绿色、蓝色等）
 */

import sharp from 'sharp';
import fs from 'fs';

/**
 * 使用 Sharp 进行智能彩色背景移除
 * 自动检测并移除最常见的背景色
 */
export async function removeColoredBackgroundWithSharp(inputPath, outputPath, options = {}) {
    const {
        colorTolerance = 60,       // 颜色容差（增加到60，适合饱和色）
        brightnessThreshold = 40,  // 亮度阈值（降低到40，避免误判绿色为暗色）
        edgeFeathering = 3,        // 边缘羽化像素（默认3）
        minAlpha = 0,              // 最小 alpha 值
        maxAlpha = 255,            // 最大 alpha 值
        aggressive = true,         // 激进模式（更彻底地移除背景）
        preserveDarkContent = false, // 禁用暗色保护（对饱和色不适用）
        useHSV = true              // 使用HSV色彩空间（更准确）
    } = options;

    try {
        // 1. 读取图片
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        console.log(`📊 图片信息: ${metadata.width}x${metadata.height}, ${metadata.format}, channels: ${metadata.channels}`);

        // 2. 转换为 RGBA 并获取原始像素数据
        const { data, info } = await image
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;
        console.log(`📊 处理图片: ${width}x${height}, channels: ${channels}`);

        // 3. 智能背景色检测
        const colorMap = new Map();

        // 采样边缘像素来确定背景色
        const sampleEdges = () => {
            const edgeSamples = [];
            const sampleSize = 10; // 边缘采样宽度

            // 上边缘
            for (let y = 0; y < sampleSize; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * channels;
                    edgeSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
                }
            }

            // 下边缘
            for (let y = height - sampleSize; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * channels;
                    edgeSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
                }
            }

            // 左边缘
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < sampleSize; x++) {
                    const i = (y * width + x) * channels;
                    edgeSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
                }
            }

            // 右边缘
            for (let y = 0; y < height; y++) {
                for (let x = width - sampleSize; x < width; x++) {
                    const i = (y * width + x) * channels;
                    edgeSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
                }
            }

            return edgeSamples;
        };

        const edgeSamples = sampleEdges();

        // 统计边缘颜色
        for (const color of edgeSamples) {
            const key = `${Math.floor(color.r / 5)}:${Math.floor(color.g / 5)}:${Math.floor(color.b / 5)}`;
            colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        // 找出最常见的背景色（假设边缘最常见的颜色就是背景色）
        let maxCount = 0;
        let bgColor = { r: 255, g: 255, b: 255 };

        for (const [key, count] of colorMap.entries()) {
            if (count > maxCount) {
                maxCount = count;
                const [r, g, b] = key.split(':').map(v => parseInt(v) * 5);
                bgColor = { r, g, b };
            }
        }

        console.log(`🎯 检测到背景色: RGB(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
        console.log(`📊 背景色样本: ${maxCount} / ${edgeSamples.length} (${(maxCount / edgeSamples.length * 100).toFixed(2)}%)`);

        // RGB转HSV辅助函数
        const rgbToHsv = (r, g, b) => {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;

            let h = 0;
            if (d !== 0) {
                if (max === r) {
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                } else if (max === g) {
                    h = ((b - r) / d + 2) / 6;
                } else {
                    h = ((r - g) / d + 4) / 6;
                }
            }

            const s = max === 0 ? 0 : d / max;
            const v = max;

            return [h * 360, s * 100, v * 100];
        };

        // 计算背景色的HSV值
        const bgHSV = useHSV ? rgbToHsv(bgColor.r, bgColor.g, bgColor.b) : null;

        if (useHSV) {
            console.log(`🎨 背景色HSV: H=${bgHSV[0].toFixed(1)}° S=${bgHSV[1].toFixed(1)}% V=${bgHSV[2].toFixed(1)}%`);
        }

        let transparentCount = 0;
        let processedCount = 0;

        const processedData = Buffer.from(data);

        // 4. 处理每个像素
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3] || 255;

            // 计算颜色距离
            let colorDistance;

            if (useHSV) {
                // 使用HSV色彩空间（更准确）
                const pixelHSV = rgbToHsv(r, g, b);

                // 色相距离（考虑循环性质）
                let hueDiff = Math.abs(pixelHSV[0] - bgHSV[0]);
                if (hueDiff > 180) {
                    hueDiff = 360 - hueDiff;
                }

                // 饱和度和明度距离
                const satDiff = Math.abs(pixelHSV[1] - bgHSV[1]);
                const valDiff = Math.abs(pixelHSV[2] - bgHSV[2]);

                // 综合距离（色相权重更高）
                colorDistance = Math.sqrt(hueDiff * hueDiff * 2 + satDiff * satDiff + valDiff * valDiff);
            } else {
                // 使用RGB欧几里得距离
                const rDiff = r - bgColor.r;
                const gDiff = g - bgColor.g;
                const bDiff = b - bgColor.b;
                colorDistance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
            }

            // 计算亮度
            const brightness = (r + g + b) / 3;

            // 判断是否为背景
            let isBackground = false;

            if (aggressive) {
                // 激进模式：使用颜色距离判断
                isBackground = colorDistance < colorTolerance;
            } else {
                // 普通模式：更保守的判断
                isBackground = colorDistance < colorTolerance / 2;
            }

            // 保护深色内容（仅在非常暗时，避免误删真实的暗色内容）
            if (preserveDarkContent && brightness < brightnessThreshold) {
                isBackground = false;
            }

            if (isBackground) {
                // 完全透明
                processedData[i + 3] = 0;
                transparentCount++;
            } else {
                // 检查是否为边缘像素（羽化效果）
                if (colorDistance > colorTolerance && colorDistance < colorTolerance + edgeFeathering * 10) {
                    // 边缘像素 - 使用渐变透明度
                    const alphaFactor = (colorDistance - colorTolerance) / (edgeFeathering * 10);
                    processedData[i + 3] = Math.max(minAlpha, Math.min(maxAlpha, Math.floor(a * alphaFactor)));
                } else {
                    // 保持原有 alpha
                    processedData[i + 3] = a;
                }
                processedCount++;
            }
        }

        console.log(`✅ 处理完成:`);
        console.log(`   - 透明像素: ${transparentCount} (${(transparentCount / (data.length / channels) * 100).toFixed(2)}%)`);
        console.log(`   - 保留像素: ${processedCount} (${(processedCount / (data.length / channels) * 100).toFixed(2)}%)`);

        // 5. 保存处理后的图片
        await sharp(processedData, {
            raw: {
                width,
                height,
                channels: 4
            }
        })
        .png({
            quality: 100,
            compressionLevel: 9,
            adaptiveFiltering: true,
            force: true
        })
        .toFile(outputPath);

        console.log(`✅ 图片已保存: ${outputPath}`);
        return true;

    } catch (error) {
        console.error(`❌ 彩色背景移除失败: ${error.message}`);
        // 如果失败，复制原文件
        fs.copyFileSync(inputPath, outputPath);
        return false;
    }
}

/**
 * 自动检测并选择最佳的背景移除算法
 */
export async function autoRemoveBackground(inputPath, outputPath, options = {}) {
    try {
        const image = sharp(inputPath);
        const { data, info } = await image
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;

        // 采样四个角落的颜色
        const corners = [
            { x: 0, y: 0 }, // 左上
            { x: width - 1, y: 0 }, // 右上
            { x: 0, y: height - 1 }, // 左下
            { x: width - 1, y: height - 1 } // 右下
        ];

        let totalR = 0, totalG = 0, totalB = 0;
        for (const corner of corners) {
            const i = (corner.y * width + corner.x) * channels;
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
        }

        const avgR = totalR / 4;
        const avgG = totalG / 4;
        const avgB = totalB / 4;
        const avgBrightness = (avgR + avgG + avgB) / 3;

        console.log(`🔍 检测到角落平均颜色: RGB(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`);
        console.log(`💡 平均亮度: ${Math.round(avgBrightness)}`);

        // 判断是浅色背景还是彩色背景
        if (avgBrightness > 200 && Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB) < 30) {
            // 浅色/白色背景
            console.log(`📋 使用浅色背景移除算法`);
            const { removeBackgroundWithSharp } = await import('./enhanced-background-removal.js');
            return await removeBackgroundWithSharp(inputPath, outputPath, options);
        } else {
            // 彩色背景
            console.log(`📋 使用彩色背景移除算法`);
            return await removeColoredBackgroundWithSharp(inputPath, outputPath, options);
        }
    } catch (error) {
        console.error(`❌ 自动背景移除失败: ${error.message}`);
        return false;
    }
}
