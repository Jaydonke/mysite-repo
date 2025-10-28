/**
 * 增强的背景移除算法
 * 专门优化用于移除白色/浅色背景
 */

import sharp from 'sharp';
import fs from 'fs';

/**
 * 使用 Sharp 进行智能背景移除
 * 针对白色和浅色背景进行优化
 */
export async function removeBackgroundWithSharp(inputPath, outputPath, options = {}) {
    const {
        threshold = 240,           // 背景检测阈值（默认240，越高越严格）
        tolerance = 15,            // 颜色容差（默认15）
        edgeFeathering = 2,        // 边缘羽化像素（默认2，使边缘更柔和）
        minAlpha = 0,              // 最小 alpha 值
        maxAlpha = 255,            // 最大 alpha 值
        aggressive = true          // 激进模式（更彻底地移除背景）
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

        // 3. 智能背景检测和移除
        const processedData = Buffer.from(data);

        // 统计背景色（假设背景是最常见的颜色）
        const colorMap = new Map();
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 只统计浅色像素
            if (r > threshold && g > threshold && b > threshold) {
                const key = `${Math.floor(r / 10)}:${Math.floor(g / 10)}:${Math.floor(b / 10)}`;
                colorMap.set(key, (colorMap.get(key) || 0) + 1);
            }
        }

        // 找出最常见的背景色
        let maxCount = 0;
        let bgColor = { r: 255, g: 255, b: 255 };

        for (const [key, count] of colorMap.entries()) {
            if (count > maxCount) {
                maxCount = count;
                const [r, g, b] = key.split(':').map(v => parseInt(v) * 10);
                bgColor = { r, g, b };
            }
        }

        console.log(`🎯 检测到背景色: RGB(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
        console.log(`📊 背景像素数: ${maxCount} / ${data.length / channels} (${(maxCount / (data.length / channels) * 100).toFixed(2)}%)`);

        let transparentCount = 0;
        let processedCount = 0;

        // 4. 处理每个像素
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3] || 255;

            // 计算与背景色的差异
            const rDiff = Math.abs(r - bgColor.r);
            const gDiff = Math.abs(g - bgColor.g);
            const bDiff = Math.abs(b - bgColor.b);
            const totalDiff = rDiff + gDiff + bDiff;

            // 判断是否为背景
            const isBackground = aggressive
                ? (
                    // 激进模式：更严格的背景检测
                    (r > threshold - tolerance && g > threshold - tolerance && b > threshold - tolerance) ||
                    (totalDiff < tolerance * 3 && r > 200 && g > 200 && b > 200)
                  )
                : (
                    // 普通模式：保守的背景检测
                    totalDiff < tolerance * 3 && r > threshold && g > threshold && b > threshold
                  );

            if (isBackground) {
                // 完全透明
                processedData[i + 3] = 0;
                transparentCount++;
            } else {
                // 检查是否为半透明边缘（羽化效果）
                const brightness = (r + g + b) / 3;

                if (brightness > threshold - edgeFeathering * 20 && brightness < threshold + 10) {
                    // 边缘像素 - 使用渐变透明度
                    const alphaFactor = 1 - ((brightness - (threshold - edgeFeathering * 20)) / (edgeFeathering * 30));
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
        console.error(`❌ 背景移除失败: ${error.message}`);
        // 如果失败，复制原文件
        fs.copyFileSync(inputPath, outputPath);
        return false;
    }
}

/**
 * 增强的边缘优化
 * 平滑边缘并移除锯齿
 */
export async function enhanceEdges(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .blur(0.3) // 轻微模糊以平滑边缘
            .png({
                quality: 100,
                compressionLevel: 9
            })
            .toFile(outputPath);

        return true;
    } catch (error) {
        console.error(`❌ 边缘优化失败: ${error.message}`);
        return false;
    }
}

/**
 * 完整的背景移除流程
 * 包括背景移除和边缘优化
 */
export async function completeBackgroundRemoval(inputPath, outputPath, options = {}) {
    const tempPath = outputPath + '.temp-processed.png';

    try {
        console.log(`\n🎨 开始智能背景移除...`);
        console.log(`📁 输入: ${inputPath}`);
        console.log(`📁 输出: ${outputPath}`);
        console.log(`⚙️  选项:`, options);

        // 步骤 1: 移除背景
        await removeBackgroundWithSharp(inputPath, tempPath, options);

        // 步骤 2: 优化边缘（可选）
        if (options.enhanceEdges) {
            console.log(`\n✨ 优化边缘...`);
            await enhanceEdges(tempPath, outputPath);
            fs.unlinkSync(tempPath);
        } else {
            fs.renameSync(tempPath, outputPath);
        }

        console.log(`\n🎉 背景移除完成！\n`);
        return true;

    } catch (error) {
        console.error(`❌ 完整流程失败: ${error.message}`);

        // 清理临时文件
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }

        return false;
    }
}

// 命令行使用示例
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3] || inputPath.replace(/(\.\w+)$/, '-no-bg$1');

    if (!inputPath) {
        console.log('使用方法: node enhanced-background-removal.js <输入图片> [输出图片] [threshold] [aggressive]');
        console.log('');
        console.log('参数说明:');
        console.log('  输入图片    - 必需，要处理的图片路径');
        console.log('  输出图片    - 可选，输出路径（默认: 输入文件名-no-bg.png）');
        console.log('  threshold  - 可选，背景检测阈值 0-255（默认: 240）');
        console.log('  aggressive - 可选，激进模式 true/false（默认: true）');
        console.log('');
        console.log('示例:');
        console.log('  node enhanced-background-removal.js input.png');
        console.log('  node enhanced-background-removal.js input.png output.png 230 true');
        process.exit(1);
    }

    const threshold = parseInt(process.argv[4]) || 240;
    const aggressive = process.argv[5] === 'true' || process.argv[5] === undefined;

    completeBackgroundRemoval(inputPath, outputPath, {
        threshold,
        aggressive,
        enhanceEdges: false,
        edgeFeathering: 2,
        tolerance: 15
    }).then(success => {
        process.exit(success ? 0 : 1);
    });
}
