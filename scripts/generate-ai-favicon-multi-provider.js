#!/usr/bin/env node

/**
 * AI-Powered Multi-Provider Image Generation Script
 * =================================================
 * Supports multiple AI image generation providers:
 * - OpenAI (DALL-E 3, GPT-image-1)
 * - Replicate (Stable Diffusion XL, FLUX)
 *
 * Generates THREE theme-adaptive images based on config.template.js:
 * 1. favicon.png → favicon/ folder
 * 2. site-logo.png → favicon_io/ folder
 * 3. site-theme.png → favicon_io/ folder
 *
 * ✨ Features:
 * - 🔄 Multiple AI providers with automatic fallback
 * - 🎨 Theme-adaptive image generation
 * - 💎 High-quality output with provider-specific optimizations
 * - ⚡ Fast generation with provider selection
 *
 * Usage:
 * - Set PROVIDER in CONFIG or via environment variable
 * - Configure API keys in .env file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import sharp from 'sharp';
import https from 'https';
import http from 'http';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    faviconDir: path.join(__dirname, '../favicon'),
    faviconIoDir: path.join(__dirname, '../favicon_io'),
    configPath: path.join(__dirname, '../config.template.js'),

    // Provider Configuration
    // Options: 'openai', 'replicate'
    provider: process.env.IMAGE_PROVIDER || 'replicate',

    // OpenAI Configuration
    openai: {
        models: {
            primary: 'dall-e-3',      // 使用 DALL-E 3（立即可用）
            fallback: 'dall-e-3'
        },
        quality: {
            gptImage: 'high',     // 'low', 'medium', 'high', 'auto'
            dalle: 'hd'           // 'standard', 'hd'
        },
        style: 'vivid'            // 'natural', 'vivid' (DALL-E only)
    },

    // Replicate Configuration
    replicate: {
        models: {
            // FLUX Schnell - Fastest, good quality
            primary: 'black-forest-labs/flux-schnell',
            // Stable Diffusion XL - High quality
            fallback: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
        },
        // FLUX parameters
        fluxParams: {
            num_outputs: 1,
            aspect_ratio: '1:1',
            output_format: 'png',
            output_quality: 100
        },
        // SDXL parameters
        sdxlParams: {
            width: 1024,
            height: 1024,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50
        }
    }
};

// ============================================================
// PROVIDER INITIALIZATION
// ============================================================

let openai, replicate;

try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
} catch (error) {
    log(`⚠️  OpenAI initialization skipped: ${error.message}`, 'yellow');
}

try {
    if (process.env.REPLICATE_API_TOKEN) {
        replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN
        });
    }
} catch (error) {
    log(`⚠️  Replicate initialization skipped: ${error.message}`, 'yellow');
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Load configuration from config.template.js
 */
async function loadConfig() {
    try {
        const configUrl = new URL(`file:///${CONFIG.configPath.replace(/\\/g, '/')}`).href;
        const configModule = await import(configUrl);
        return configModule.CURRENT_WEBSITE_CONTENT;
    } catch (error) {
        log(`❌ Failed to load config: ${error.message}`, 'red');
        throw error;
    }
}

/**
 * Download image from URL
 */
async function downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(outputPath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

/**
 * Generate image prompt based on config
 */
function generateImagePrompt(config, imageType) {
    const title = config.title || 'Website';
    const description = config.description || 'A modern website';
    const primaryColorName = config.colorTheme?.primary || 'green';

    // Color mapping
    const colorMap = {
        'orange': 'warm orange',
        'red': 'vibrant red',
        'blue': 'calm blue',
        'green': 'fresh green',
        'emerald': 'emerald green',
        'purple': 'royal purple',
        'pink': 'soft pink',
        'yellow': 'sunny yellow',
        'cyan': 'cool cyan',
        'teal': 'teal blue',
        'indigo': 'deep indigo'
    };

    const colorDesc = colorMap[primaryColorName] || 'green';

    let prompt = '';

    if (imageType === 'favicon') {
        prompt = `A simple minimalist icon in ${colorDesc} color scheme.
Modern geometric design with clean lines.
Professional and elegant appearance.
Single solid shape, no text, white background.`;
    } else if (imageType === 'logo') {
        prompt = `A modern professional logo design in ${colorDesc} colors.
Clean and memorable visual identity.
Simple geometric shapes, contemporary style.
No text or letters, white background, vector illustration.`;
    } else if (imageType === 'theme') {
        prompt = `An abstract decorative pattern with ${colorDesc} accents.
Elegant and subtle design elements.
Modern minimalist aesthetic.
No text, white background, artistic composition.`;
    }

    return prompt.trim();
}

// ============================================================
// IMAGE GENERATION - OPENAI
// ============================================================

async function generateImageWithOpenAI(prompt, size = '1024x1024') {
    if (!openai) {
        throw new Error('OpenAI not initialized. Check OPENAI_API_KEY in .env');
    }

    const { models, quality, style } = CONFIG.openai;

    try {
        log(`🎨 Generating with OpenAI ${models.primary.toUpperCase()}...`, 'cyan');

        const modelQuality = models.primary.includes('dall-e') ? quality.dalle : quality.gptImage;

        const apiParams = {
            model: models.primary,
            prompt: prompt + `\n\nIMPORTANT: Pure white or transparent background, no text, clean edges, professional quality.`,
            n: 1,
            size: size,
            quality: modelQuality
        };

        // Only add style for DALL-E models
        if (models.primary.includes('dall-e')) {
            apiParams.style = style;
        }

        const response = await openai.images.generate(apiParams);
        const imageUrl = response.data[0].url;

        log(`✅ Generated with ${models.primary.toUpperCase()}`, 'green');
        return imageUrl;

    } catch (error) {
        log(`❌ ${models.primary.toUpperCase()} failed: ${error.message}`, 'red');

        // Fallback to DALL-E 3
        if (models.fallback) {
            log(`⚠️  Falling back to ${models.fallback.toUpperCase()}...`, 'yellow');

            const fallbackParams = {
                model: models.fallback,
                prompt: prompt + `\n\nIMPORTANT: Pure white or transparent background, no text, clean edges, professional quality.`,
                n: 1,
                size: size,
                quality: quality.dalle
            };

            if (models.fallback.includes('dall-e')) {
                fallbackParams.style = style;
            }

            const fallbackResponse = await openai.images.generate(fallbackParams);
            log(`✅ Generated with ${models.fallback.toUpperCase()}`, 'green');
            return fallbackResponse.data[0].url;
        }

        throw error;
    }
}

// ============================================================
// IMAGE GENERATION - REPLICATE
// ============================================================

async function generateImageWithReplicate(prompt, size = '1024x1024') {
    if (!replicate) {
        throw new Error('Replicate not initialized. Check REPLICATE_API_TOKEN in .env');
    }

    const { models, fluxParams, sdxlParams } = CONFIG.replicate;

    try {
        const modelName = models.primary.split('/')[1].split(':')[0];
        log(`🎨 Generating with Replicate ${modelName.toUpperCase()}...`, 'cyan');

        const enhancedPrompt = prompt + `, pure white background, no text, clean professional design, high quality, detailed`;

        let input;
        if (models.primary.includes('flux')) {
            input = {
                ...fluxParams,
                prompt: enhancedPrompt
            };
        } else {
            input = {
                ...sdxlParams,
                prompt: enhancedPrompt,
                negative_prompt: 'text, letters, words, watermark, signature, blurry, low quality'
            };
        }

        const output = await replicate.run(models.primary, { input });

        let imageUrl;
        if (Array.isArray(output)) {
            imageUrl = output[0];
        } else if (typeof output === 'string') {
            imageUrl = output;
        } else if (output.url) {
            imageUrl = output.url;
        } else {
            throw new Error('Unexpected output format from Replicate');
        }

        log(`✅ Generated with Replicate ${modelName.toUpperCase()}`, 'green');
        return imageUrl;

    } catch (error) {
        log(`❌ Replicate ${models.primary} failed: ${error.message}`, 'red');

        // Fallback to SDXL
        if (models.fallback && models.fallback !== models.primary) {
            log(`⚠️  Falling back to Stable Diffusion XL...`, 'yellow');

            const enhancedPrompt = prompt + `, pure white background, no text, clean professional design, high quality, detailed`;

            const input = {
                ...sdxlParams,
                prompt: enhancedPrompt,
                negative_prompt: 'text, letters, words, watermark, signature, blurry, low quality'
            };

            const output = await replicate.run(models.fallback, { input });
            const imageUrl = Array.isArray(output) ? output[0] : output;

            log(`✅ Generated with Stable Diffusion XL (fallback)`, 'green');
            return imageUrl;
        }

        throw error;
    }
}

// ============================================================
// MAIN GENERATION FUNCTION
// ============================================================

async function generateImage(prompt, size = '1024x1024') {
    const provider = CONFIG.provider.toLowerCase();

    log(`📡 Using provider: ${provider.toUpperCase()}`, 'blue');

    try {
        if (provider === 'openai') {
            return await generateImageWithOpenAI(prompt, size);
        } else if (provider === 'replicate') {
            return await generateImageWithReplicate(prompt, size);
        } else {
            throw new Error(`Unknown provider: ${provider}. Use 'openai' or 'replicate'`);
        }
    } catch (error) {
        // Try fallback provider if available
        if (provider === 'replicate' && openai) {
            log(`⚠️  Replicate failed, trying OpenAI as fallback...`, 'yellow');
            return await generateImageWithOpenAI(prompt, size);
        } else if (provider === 'openai' && replicate) {
            log(`⚠️  OpenAI failed, trying Replicate as fallback...`, 'yellow');
            return await generateImageWithReplicate(prompt, size);
        }
        throw error;
    }
}

// ============================================================
// IMAGE PROCESSING
// ============================================================

async function removeBackground(imagePath) {
    try {
        const imageBuffer = await sharp(imagePath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { data, info } = imageBuffer;
        const { width, height, channels } = info;

        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect white/near-white pixels
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Set alpha to transparent
            }
        }

        await sharp(data, {
            raw: {
                width,
                height,
                channels
            }
        })
            .png()
            .toFile(imagePath);

        log(`✅ Background removed`, 'green');
    } catch (error) {
        log(`⚠️  Background removal failed: ${error.message}`, 'yellow');
    }
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
    console.log('');
    log('====================================', 'bright');
    log('   Multi-Provider Image Generator', 'bright');
    log('====================================', 'bright');
    log(`Provider: ${CONFIG.provider.toUpperCase()}`, 'cyan');
    log('Generates favicon, site-logo, and site-theme with transparent backgrounds', 'cyan');

    try {
        // Load config
        log('\n📚 Loading configuration...', 'cyan');
        const siteConfig = await loadConfig();
        const category = siteConfig.category || siteConfig.seo?.keywords?.[0] || 'General';
        const primaryColor = siteConfig.primaryColor || siteConfig.branding?.primaryColor || '#10B981';
        const secondaryColor = siteConfig.secondaryColor || siteConfig.branding?.secondaryColor || '#047857';

        log(`✅ Loaded config for: ${siteConfig.title} (${category})`, 'green');
        log(`  Primary Color: ${primaryColor}`, 'blue');
        log(`  Secondary Color: ${secondaryColor}`, 'blue');

        // Ensure directories exist
        if (!fs.existsSync(CONFIG.faviconDir)) {
            fs.mkdirSync(CONFIG.faviconDir, { recursive: true });
        }
        if (!fs.existsSync(CONFIG.faviconIoDir)) {
            fs.mkdirSync(CONFIG.faviconIoDir, { recursive: true });
        }

        // Generate images
        const images = [
            { type: 'favicon', path: path.join(CONFIG.faviconDir, 'favicon.png'), desc: 'favicon image' },
            { type: 'logo', path: path.join(CONFIG.faviconIoDir, 'site-logo.png'), desc: 'site logo' },
            { type: 'theme', path: path.join(CONFIG.faviconIoDir, 'site-theme.png'), desc: 'site theme image' }
        ];

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            log(`\n🎨 [${i + 1}/${images.length}] Generating ${img.desc}...`, 'cyan');

            const prompt = generateImagePrompt(siteConfig, img.type);
            const imageUrl = await generateImage(prompt);

            log(`📥 Downloading image...`, 'cyan');
            const tempPath = img.path + '.temp';
            await downloadImage(imageUrl, tempPath);

            log(`🎨 Removing background...`, 'cyan');
            await removeBackground(tempPath);

            fs.renameSync(tempPath, img.path);
            log(`✅ Saved to: ${img.path}`, 'green');
        }

        // Success
        log('\n====================================', 'green');
        log('    ✨ Generation Complete!', 'green');
        log('====================================', 'green');
        log('\n📁 Generated files:', 'cyan');
        images.forEach(img => {
            log(`  ✅ ${img.path}`, 'green');
        });

        log('\n💡 Next steps:', 'cyan');
        log('  1. Run "npm run generate-favicon" to process favicon into all sizes', 'yellow');
        log('  2. Run "npm run update-favicon" to deploy all images to the site', 'yellow');
        log('  3. Clear browser cache to see the changes', 'yellow');

        log('\n📝 Note:', 'blue');
        log('  - All images have transparent backgrounds', 'blue');
        log('  - The generate-favicon script will create all required favicon sizes', 'blue');
        log('  - The update-favicon script will copy everything to the correct locations', 'blue');

    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        if (error.stack) {
            log(error.stack, 'gray');
        }
        process.exit(1);
    }
}

main();
