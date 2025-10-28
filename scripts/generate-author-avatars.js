#!/usr/bin/env node

/**
 * 为30个作者生成专业头像
 * 使用OpenAI DALL-E API生成多样化的专业照片
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const authorsDir = path.join(__dirname, '../src/content/authors');
const assetsDir = path.join(__dirname, '../src/assets/images/authors');

// 颜色输出
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

// 初始化OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ==========================================
// 动态作者信息读取和提示词生成
// ==========================================

/**
 * 从名字推断性别
 */
function inferGender(firstName) {
  const maleNames = ['James', 'Michael', 'David', 'Daniel', 'Matthew', 'Christopher', 'Alexander', 'Thomas', 'Robert', 'William', 'Joseph', 'Benjamin', 'Samuel', 'Henry', 'Hiroshi', 'Kenji', 'Jin', 'Ryu', 'Ahmed', 'Omar', 'Karim', 'Malik', 'Tariq', 'Khalid', 'Rahman', 'Carlos', 'Diego', 'Miguel', 'Gabriel', 'Antonio', 'Pablo', 'Marco', 'Rafael', 'Fernando', 'Javier', 'Kofi', 'Kwame', 'Jabari', 'Chidi', 'Jamal', 'Kwesi', 'Malik', 'Abasi', 'Arjun', 'Ravi', 'Rohan', 'Vikram', 'Sanjay', 'Arun', 'Krishna', 'Amit', 'Rahul', 'Kiran'];
  const femaleNames = ['Sarah', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Charlotte', 'Rachel', 'Emily', 'Grace', 'Abigail', 'Madison', 'Elizabeth', 'Victoria', 'Natalie', 'Yuki', 'Mei', 'Aiko', 'Sakura', 'Hana', 'Ling', 'Xiu', 'Yuna', 'Sora', 'Fatima', 'Layla', 'Yasmin', 'Amira', 'Zara', 'Nadia', 'Aisha', 'Leila', 'Samira', 'Salma', 'Elena', 'Sofia', 'Lucia', 'Carmen', 'Rosa', 'Ana', 'Maria', 'Valentina', 'Camila', 'Amara', 'Zuri', 'Nia', 'Imani', 'Ayana', 'Makena', 'Sanaa', 'Zahara', 'Amani', 'Kaya', 'Priya', 'Neha', 'Anjali', 'Maya', 'Kavya', 'Diya', 'Meera', 'Shreya', 'Pooja'];

  if (maleNames.includes(firstName)) return 'male';
  if (femaleNames.includes(firstName)) return 'female';
  return 'neutral'; // 默认中性
}

/**
 * 从名字推断种族背景
 */
function inferEthnicity(firstName, lastName) {
  const asianLastNames = ['Chen', 'Wang', 'Li', 'Zhang', 'Liu', 'Yang', 'Huang', 'Tanaka', 'Watanabe', 'Suzuki', 'Kim', 'Park', 'Choi', 'Yamamoto', 'Nakamura', 'Lee', 'Wong', 'Ng', 'Chan', 'Lin'];
  const middleEasternLastNames = ['Hassan', 'Ali', 'Abdullah', 'Mohammed', 'Ibrahim', 'Mansour', 'Rashid', 'Khalil', 'Farah', 'Nasser', 'Ahmad', 'Mahmoud', 'Zahir', 'Saeed', 'Habib'];
  const hispanicLastNames = ['Garcia', 'Gonzalez', 'Hernandez', 'Perez', 'Sanchez', 'Rivera', 'Torres', 'Mendoza', 'Santos', 'Russo', 'Silva', 'Fernandez', 'Morales', 'Santiago', 'Vargas', 'Castillo', 'Jimenez', 'Ramos', 'Cruz', 'Ortiz'];
  const africanLastNames = ['Okafor', 'Mensah', 'Diallo', 'Nkrumah', 'Adeyemi', 'Mwangi', 'Okoro', 'Kamau', 'Abebe', 'Desta', 'Osei', 'Eze', 'Kone', 'Banda', 'Mutombo'];
  const indianLastNames = ['Patel', 'Sharma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Desai', 'Mehta', 'Joshi', 'Shah', 'Iyer', 'Nair', 'Bose', 'Malhotra'];

  if (asianLastNames.includes(lastName)) return 'East Asian';
  if (middleEasternLastNames.includes(lastName)) return 'Middle Eastern';
  if (hispanicLastNames.includes(lastName)) return 'Hispanic';
  if (africanLastNames.includes(lastName)) return 'African';
  if (indianLastNames.includes(lastName)) return 'South Asian';

  return 'Caucasian'; // 默认
}

/**
 * 生成年龄范围
 */
function generateAgeRange() {
  const ranges = ['25-35', '30-40', '35-45', '40-50', '40-55'];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

/**
 * 从职位提取主要专业
 */
function extractProfession(jobTitle) {
  // 提取第一个 & 之前的部分作为主要职业
  const mainJob = jobTitle.split('&')[0].trim();
  return mainJob;
}

/**
 * 生成DALL-E提示词
 */
function generatePrompt(authorInfo) {
  const { job, gender, ethnicity, age } = authorInfo;
  const profession = extractProfession(job);

  // 性别描述
  const genderDesc = gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'person';

  // 种族描述
  let ethnicDesc = '';
  if (ethnicity === 'East Asian') ethnicDesc = 'East Asian';
  else if (ethnicity === 'South Asian') ethnicDesc = 'South Asian';
  else if (ethnicity === 'Middle Eastern') ethnicDesc = 'Middle Eastern';
  else if (ethnicity === 'Hispanic') ethnicDesc = 'Hispanic';
  else if (ethnicity === 'African') ethnicDesc = 'African';
  else ethnicDesc = 'Caucasian';

  // 职业风格
  let attireStyle = 'professional attire';
  let settingStyle = 'neutral background, natural lighting';
  let expressionStyle = 'warm and approachable expression';

  if (job.includes('Psychiatrist') || job.includes('Medical')) {
    attireStyle = 'medical professional attire';
    settingStyle = 'clinical setting, professional lighting';
  } else if (job.includes('Yoga') || job.includes('Meditation') || job.includes('Mindfulness')) {
    attireStyle = 'comfortable wellness attire';
    settingStyle = 'peaceful natural setting, soft lighting';
    expressionStyle = 'calm and centered expression';
  } else if (job.includes('Art') || job.includes('Music') || job.includes('Creative')) {
    attireStyle = 'creative professional attire';
    settingStyle = 'artistic background, natural lighting';
    expressionStyle = 'expressive and empathetic expression';
  } else if (job.includes('Coach') || job.includes('Counselor')) {
    attireStyle = 'business casual attire';
    expressionStyle = 'encouraging and supportive expression';
  } else if (job.includes('Therapist')) {
    attireStyle = 'professional casual attire';
    expressionStyle = 'compassionate and understanding expression';
  } else if (job.includes('Nature') || job.includes('Environmental')) {
    attireStyle = 'outdoor professional attire';
    settingStyle = 'natural green background, outdoor lighting';
    expressionStyle = 'peaceful and grounded expression';
  }

  // 改进的提示词 - 避免生成对比图或多人头像
  const prompt = `A single centered portrait photograph showing only one ${ethnicDesc} ${genderDesc} ${profession.toLowerCase()}, age ${age.split('-')[0]}, ${expressionStyle}, wearing ${attireStyle}, ${settingStyle}, close-up headshot, professional portrait style, single subject only, centered composition, absolutely no multiple views, no side-by-side images, no comparison photos, no duplicates, one person centered in frame, studio portrait, no text overlays`;

  return prompt;
}

/**
 * 读取现有作者信息
 */
function readAuthorsFromDirectory() {
  const authors = [];

  if (!fs.existsSync(authorsDir)) {
    log('❌ 作者目录不存在', 'red');
    return authors;
  }

  const authorDirs = fs.readdirSync(authorsDir);

  for (const slug of authorDirs) {
    const authorPath = path.join(authorsDir, slug);
    const mdxPath = path.join(authorPath, 'index.mdx');

    if (!fs.statSync(authorPath).isDirectory()) continue;
    if (!fs.existsSync(mdxPath)) continue;

    try {
      const content = fs.readFileSync(mdxPath, 'utf-8');

      // 解析MDX frontmatter
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const jobMatch = content.match(/^job:\s*(.+)$/m);

      if (!nameMatch || !jobMatch) continue;

      const name = nameMatch[1].trim();
      const job = jobMatch[1].trim();

      // 提取名字用于推断
      const firstName = name.replace(/^Dr\.\s+/, '').split(' ')[0];
      const lastName = name.replace(/^Dr\.\s+/, '').split(' ').pop();

      const gender = inferGender(firstName);
      const ethnicity = inferEthnicity(firstName, lastName);
      const age = generateAgeRange();
      const profession = extractProfession(job);

      const authorInfo = {
        slug,
        name,
        gender,
        ethnicity,
        age,
        profession,
        job
      };

      authorInfo.prompt = generatePrompt(authorInfo);

      authors.push(authorInfo);

    } catch (error) {
      log(`⚠️  无法读取作者信息: ${slug}`, 'yellow');
    }
  }

  return authors;
}

// 动态读取作者信息（替代硬编码列表）
const authorAvatarPrompts = readAuthorsFromDirectory();

/**
 * 下载图片从URL到本地
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * 使用 GPT-4o-mini Vision 检测图片人数和布局问题
 */
async function detectPersonCount(imagePath) {
  try {
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
              text: `Analyze this image and answer two questions:
1. How many distinct people are shown in this image? (Count carefully - if you see the same person multiple times in a split/comparison layout, count each instance)
2. Is this a single centered portrait, or a split/comparison/side-by-side layout?

Answer in this exact format:
People count: [number]
Layout: [single/split]`
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
      max_tokens: 50
    });

    const answer = response.choices[0].message.content.trim();
    const countMatch = answer.match(/People count:\s*(\d+)/i);
    const layoutMatch = answer.match(/Layout:\s*(single|split)/i);

    const personCount = parseInt(countMatch?.[1] || '0');
    const isSplit = layoutMatch?.[1]?.toLowerCase() === 'split';

    // 如果是分裂布局，即使只检测到1人也视为问题
    if (isSplit) {
      log(`  ⚠️  检测到分裂/对比布局`, 'yellow');
      return 2; // 返回2表示不合格
    }

    return personCount;

  } catch (error) {
    log(`  ⚠️  人数检测失败: ${error.message}`, 'yellow');
    return -1; // 返回-1表示检测失败，跳过验证
  }
}

/**
 * 为单个作者生成头像（带多人检测和自动重试）
 */
async function generateAvatar(authorInfo, index, total) {
  const avatarPath = path.join(assetsDir, authorInfo.slug, 'avatar.jpg');
  const MAX_RETRIES = 3; // 最多重试3次

  try {
    log(`\n[${index + 1}/${total}] 生成头像: ${authorInfo.name}`, 'cyan');
    log(`  专业: ${authorInfo.profession}`, 'gray');
    log(`  提示词: ${authorInfo.prompt.substring(0, 80)}...`, 'gray');

    // 检查文件是否已存在且大小合理
    if (fs.existsSync(avatarPath)) {
      const stats = fs.statSync(avatarPath);
      if (stats.size > 5000) { // 如果大于5KB，认为是有效图片
        log(`  ⏭️  头像已存在，跳过`, 'yellow');
        return { success: true, skipped: true };
      }
    }

    let attempt = 0;
    let lastError = null;

    while (attempt < MAX_RETRIES) {
      try {
        attempt++;

        if (attempt > 1) {
          log(`  🔄 第 ${attempt} 次尝试...`, 'yellow');
        }

        log(`  🎨 调用DALL-E API...`, 'blue');

        // 调用OpenAI DALL-E API
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: authorInfo.prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "natural"
        });

        const imageUrl = response.data[0].url;
        log(`  📥 下载图片...`, 'blue');

        // 下载图片到临时位置
        const tempPath = avatarPath + '.tmp';
        await downloadImage(imageUrl, tempPath);

        // 验证文件大小
        const stats = fs.statSync(tempPath);
        if (stats.size < 1000) {
          fs.unlinkSync(tempPath);
          throw new Error('Downloaded file too small');
        }

        // 🔍 检测人数
        log(`  🔍 检测图片人数...`, 'blue');
        const personCount = await detectPersonCount(tempPath);

        if (personCount > 1) {
          fs.unlinkSync(tempPath);
          log(`  ⚠️  检测到 ${personCount} 人，不符合单人头像要求`, 'yellow');

          if (attempt < MAX_RETRIES) {
            log(`  🔄 将重新生成...`, 'yellow');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
            continue; // 重试
          } else {
            throw new Error(`After ${MAX_RETRIES} attempts, still generating multi-person images`);
          }
        } else if (personCount === 1) {
          log(`  ✅ 确认为单人头像`, 'green');
        } else if (personCount === -1) {
          log(`  ⚠️  人数检测失败，跳过验证`, 'yellow');
        }

        // 移动到最终位置
        fs.renameSync(tempPath, avatarPath);

        log(`  ✅ 成功! (${(stats.size / 1024).toFixed(1)}KB)`, 'green');

        return {
          success: true,
          size: stats.size,
          url: imageUrl,
          attempts: attempt,
          personCount: personCount
        };

      } catch (err) {
        lastError = err;

        // 如果是网络错误或API错误，等待后重试
        if (attempt < MAX_RETRIES) {
          log(`  ⚠️  生成失败: ${err.message}`, 'yellow');
          await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
        }
      }
    }

    // 所有重试都失败
    throw lastError || new Error('All retry attempts failed');

  } catch (error) {
    log(`  ❌ 失败: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量生成所有作者头像
 */
async function generateAllAvatars(options = {}) {
  const {
    concurrent = 1,  // 默认串行，避免API限制
    startFrom = 0,
    maxCount = 30
  } = options;

  log('\n🎨 开始生成作者头像', 'bright');
  log('=' .repeat(70), 'cyan');

  const authors = authorAvatarPrompts.slice(startFrom, startFrom + maxCount);
  const total = authors.length;

  log(`\n📊 任务信息:`, 'yellow');
  log(`  - 总作者数: ${total}`, 'blue');
  log(`  - 并发数: ${concurrent}`, 'blue');
  log(`  - 开始位置: ${startFrom + 1}`, 'blue');

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    retries: 0,
    multiPersonRetries: 0
  };

  // 按批次处理
  for (let i = 0; i < authors.length; i += concurrent) {
    const batch = authors.slice(i, Math.min(i + concurrent, authors.length));

    if (batch.length > 1) {
      log(`\n📦 处理批次 ${Math.floor(i / concurrent) + 1}...`, 'magenta');
    }

    const promises = batch.map((author, batchIndex) =>
      generateAvatar(author, i + batchIndex, total)
    );

    const batchResults = await Promise.all(promises);

    batchResults.forEach((result, idx) => {
      if (result.success) {
        if (result.skipped) {
          results.skipped++;
        } else {
          results.success++;
          if (result.attempts > 1) {
            results.retries += (result.attempts - 1);
            results.multiPersonRetries += (result.attempts - 1);
          }
        }
      } else {
        results.failed++;
        results.errors.push({
          author: batch[idx].name,
          error: result.error
        });
      }
    });

    // 在批次之间添加延迟，避免API限制
    if (i + concurrent < authors.length && concurrent > 1) {
      log(`\n⏳ 等待3秒后继续...`, 'gray');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 显示结果统计
  log('\n' + '=' .repeat(70), 'cyan');
  log('📈 生成结果统计:', 'bright');
  log('=' .repeat(70), 'cyan');

  log(`\n✅ 成功: ${results.success} 个头像`, 'green');
  log(`⏭️  跳过: ${results.skipped} 个头像 (已存在)`, 'yellow');
  log(`❌ 失败: ${results.failed} 个头像`, results.failed > 0 ? 'red' : 'gray');
  log(`📊 总计: ${total} 个作者`, 'blue');

  if (results.retries > 0) {
    log(`\n🔄 重试统计:`, 'yellow');
    log(`  - 因多人头像重试: ${results.multiPersonRetries} 次`, 'yellow');
    log(`  - 总重试次数: ${results.retries} 次`, 'yellow');
  }

  if (results.errors.length > 0) {
    log(`\n❌ 失败详情:`, 'red');
    results.errors.forEach((err, i) => {
      log(`  ${i + 1}. ${err.author}: ${err.error}`, 'red');
    });
  }

  if (results.success > 0 || results.skipped > 0) {
    log(`\n🎉 头像生成完成！`, 'green');
    log(`\n📁 头像位置: src/assets/images/authors/{author-slug}/avatar.jpg`, 'cyan');
  }

  return results;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  // 解析参数
  const options = {
    concurrent: 1,
    startFrom: 0,
    maxCount: 30
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--concurrent' || args[i] === '-c') {
      options.concurrent = parseInt(args[++i]) || 1;
    } else if (args[i] === '--start' || args[i] === '-s') {
      options.startFrom = parseInt(args[++i]) || 0;
    } else if (args[i] === '--count' || args[i] === '-n') {
      options.maxCount = parseInt(args[++i]) || 30;
    } else if (args[i] === '--dry-run') {
      // Dry run mode - 只显示提示词不生成图片
      log('\n🔍 Dry Run Mode - 显示生成的提示词', 'cyan');
      log('=' .repeat(70), 'cyan');
      const authors = authorAvatarPrompts;
      authors.forEach((author, index) => {
        log(`\n[${index + 1}/${authors.length}] ${author.name}`, 'bright');
        log(`  Slug: ${author.slug}`, 'blue');
        log(`  Job: ${author.job}`, 'blue');
        log(`  Gender: ${author.gender}, Ethnicity: ${author.ethnicity}, Age: ${author.age}`, 'gray');
        log(`  Prompt: ${author.prompt}`, 'yellow');
      });
      log('\n✅ Dry run 完成！共 ' + authors.length + ' 个作者', 'green');
      process.exit(0);
    } else if (args[i] === '--help' || args[i] === '-h') {
      log('\n🎨 作者头像生成工具', 'bright');
      log('=' .repeat(50), 'cyan');
      log('\n使用方法:', 'yellow');
      log('  node scripts/generate-author-avatars.js [options]', 'white');
      log('\n选项:', 'yellow');
      log('  --concurrent, -c  并发数 (默认: 1)', 'white');
      log('  --start, -s       起始位置 (默认: 0)', 'white');
      log('  --count, -n       生成数量 (默认: 30)', 'white');
      log('  --help, -h        显示帮助', 'white');
      log('\n示例:', 'yellow');
      log('  node scripts/generate-author-avatars.js', 'cyan');
      log('  node scripts/generate-author-avatars.js -c 2', 'cyan');
      log('  node scripts/generate-author-avatars.js -s 10 -n 5', 'cyan');
      process.exit(0);
    }
  }

  // 检查API密钥
  if (!process.env.OPENAI_API_KEY) {
    log('\n❌ 错误: 未找到OPENAI_API_KEY环境变量', 'red');
    log('请在.env文件中设置OPENAI_API_KEY', 'yellow');
    process.exit(1);
  }

  // 确保目录存在
  if (!fs.existsSync(assetsDir)) {
    log('\n❌ 错误: 作者资源目录不存在', 'red');
    log(`请确认路径: ${assetsDir}`, 'yellow');
    process.exit(1);
  }

  try {
    await generateAllAvatars(options);
  } catch (error) {
    log(`\n❌ 致命错误: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 运行脚本
main().catch(error => {
  log(`\n❌ 未预期的错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
