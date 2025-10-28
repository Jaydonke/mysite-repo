#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeImage(imagePath) {
  console.log('正在分析图片...\n');

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Carefully analyze this image and answer these questions:

1. How many DISTINCT people/persons are visible in this image? Count carefully - are there multiple people side by side, or is this showing the same person in different poses/angles?

2. Are there any visible text, words, labels, or watermarks?

3. Rate the image quality (1-10)

4. Is/are the face(s) clear and well-lit?

5. Describe what you see in detail.

Please provide a detailed analysis.`
          },
          {
            type: "image_url",
            image_url: {
              url: dataUrl
            }
          }
        ]
      }
    ],
    max_tokens: 800
  });

  console.log('分析结果：\n');
  console.log(response.choices[0].message.content);
}

const imagePath = process.argv[2];
if (!imagePath) {
  console.error('请提供图片路径');
  process.exit(1);
}

analyzeImage(imagePath).catch(console.error);
