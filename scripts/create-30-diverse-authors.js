#!/usr/bin/env node

/**
 * 创建30个多样化的新作者
 * 涵盖不同专业领域、文化背景和专长
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ==========================================
// 随机作者生成器
// ==========================================

// 多文化名字库
const firstNames = {
  western: ['Sarah', 'James', 'Emma', 'Michael', 'Olivia', 'David', 'Sophia', 'Daniel', 'Isabella', 'Matthew', 'Ava', 'Christopher', 'Mia', 'Alexander', 'Charlotte', 'Rachel', 'Thomas', 'Emily', 'Robert', 'Grace', 'William', 'Abigail', 'Joseph', 'Madison', 'Benjamin', 'Elizabeth', 'Samuel', 'Victoria', 'Henry', 'Natalie'],
  asian: ['Yuki', 'Hiroshi', 'Mei', 'Kenji', 'Li', 'Wei', 'Aiko', 'Jin', 'Sakura', 'Chen', 'Ming', 'Akira', 'Hana', 'Ryu', 'Ling', 'Xiu', 'Jun', 'Yuna', 'Taro', 'Sora'],
  middleEastern: ['Fatima', 'Ahmed', 'Layla', 'Omar', 'Yasmin', 'Hassan', 'Amira', 'Karim', 'Zara', 'Malik', 'Nadia', 'Tariq', 'Aisha', 'Khalid', 'Leila', 'Rahman', 'Samira', 'Faisal', 'Salma', 'Jamil'],
  hispanic: ['Carlos', 'Elena', 'Diego', 'Isabella', 'Miguel', 'Sofia', 'Gabriel', 'Lucia', 'Antonio', 'Carmen', 'Pablo', 'Rosa', 'Marco', 'Ana', 'Rafael', 'Maria', 'Fernando', 'Valentina', 'Javier', 'Camila'],
  african: ['Amara', 'Kofi', 'Zuri', 'Kwame', 'Nia', 'Jabari', 'Imani', 'Chidi', 'Ayana', 'Tariq', 'Makena', 'Desta', 'Sanaa', 'Jamal', 'Zahara', 'Kwesi', 'Amani', 'Malik', 'Kaya', 'Abasi'],
  indian: ['Priya', 'Arjun', 'Neha', 'Ravi', 'Aisha', 'Rohan', 'Anjali', 'Vikram', 'Maya', 'Sanjay', 'Kavya', 'Arun', 'Diya', 'Krishna', 'Meera', 'Amit', 'Shreya', 'Rahul', 'Pooja', 'Kiran']
};

const lastNames = {
  western: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Green', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Evans', 'Collins', 'Stewart', 'Morris', 'Murphy', 'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell'],
  asian: ['Chen', 'Wang', 'Li', 'Zhang', 'Liu', 'Yang', 'Huang', 'Tanaka', 'Watanabe', 'Suzuki', 'Kim', 'Park', 'Choi', 'Yamamoto', 'Nakamura', 'Lee', 'Wong', 'Ng', 'Chan', 'Lin'],
  middleEastern: ['Hassan', 'Ali', 'Abdullah', 'Mohammed', 'Ibrahim', 'Mansour', 'Rashid', 'Khalil', 'Farah', 'Nasser', 'Ahmad', 'Mahmoud', 'Zahir', 'Saeed', 'Habib'],
  hispanic: ['Garcia', 'Gonzalez', 'Hernandez', 'Perez', 'Sanchez', 'Rivera', 'Torres', 'Mendoza', 'Santos', 'Russo', 'Silva', 'Fernandez', 'Morales', 'Santiago', 'Vargas', 'Castillo', 'Jimenez', 'Ramos', 'Cruz', 'Ortiz'],
  african: ['Okafor', 'Mensah', 'Diallo', 'Nkrumah', 'Adeyemi', 'Mwangi', 'Okoro', 'Kamau', 'Abebe', 'Desta', 'Osei', 'Eze', 'Kone', 'Banda', 'Mutombo'],
  indian: ['Patel', 'Sharma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Desai', 'Mehta', 'Joshi', 'Shah', 'Iyer', 'Nair', 'Bose', 'Malhotra']
};

// 心理健康职业库
const mentalHealthJobs = [
  'Clinical Psychologist & Wellness Expert',
  'Meditation Teacher & Mindfulness Coach',
  'Psychiatrist & Sleep Medicine Specialist',
  'Nutrition & Mental Health Coach',
  'Yoga Therapist & Trauma Specialist',
  'Digital Wellness Advocate',
  'Child & Adolescent Psychiatrist',
  'Exercise Physiologist & Mental Health Advocate',
  'Art Therapist & Creative Wellness Coach',
  'Neuropsychologist & Brain Health Expert',
  'Holistic Life Coach & Wellness Consultant',
  'Addiction Recovery Counselor',
  'Couples Therapist & Relationship Expert',
  'Psychopharmacologist & Research Scientist',
  'Grief Counselor & End-of-Life Specialist',
  'Career Counselor & Burnout Prevention Coach',
  'Ayurvedic Wellness Practitioner',
  'Sports Psychologist & Performance Coach',
  'Ikigai Coach & Purpose-Finding Guide',
  'Cognitive Behavioral Therapist (CBT)',
  'Women\'s Mental Health Specialist',
  'Positive Psychology Practitioner',
  'Body Image & Eating Disorder Specialist',
  'Geriatric Psychiatrist',
  'LGBTQ+ Affirmative Therapist',
  'Acceptance & Commitment Therapy (ACT) Specialist',
  'Cultural Competence & Diversity Counselor',
  'Dialectical Behavior Therapy (DBT) Therapist',
  'Environmental Psychology Researcher',
  'Music Therapist & Sound Healing Practitioner',
  'Somatic Experiencing Practitioner',
  'Expressive Arts Therapist',
  'Integrative Mental Health Consultant',
  'Stress Management Specialist',
  'Trauma-Informed Therapist',
  'Neurofeedback Specialist',
  'Play Therapist & Child Development Expert',
  'Group Therapy Facilitator',
  'Breathwork Facilitator & Wellness Guide',
  'Nature Therapy Guide & Ecotherapist'
];

// Bio模板生成器
const bioTemplates = {
  'Psychologist': [
    'Specializes in cognitive behavioral therapy and evidence-based interventions. With over {years} years of clinical experience, helps individuals develop sustainable mental health practices.',
    'Expert in psychological assessment and therapeutic interventions. Focuses on helping clients overcome anxiety, depression, and life transitions through compassionate care.',
    'Licensed psychologist with expertise in treating complex mental health challenges. Believes in collaborative, client-centered therapeutic relationships that foster growth.'
  ],
  'Meditation': [
    'Former {profession} who found inner peace through meditation. Now teaches mindfulness and stress management techniques to people seeking balance and clarity.',
    'Trained in multiple meditation traditions and mindfulness practices. Helps individuals cultivate presence, reduce stress, and develop greater emotional awareness.',
    'Brings ancient meditation wisdom to modern life. Specializes in teaching accessible mindfulness techniques for managing stress and enhancing well-being.'
  ],
  'Psychiatrist': [
    'Board-certified psychiatrist specializing in {specialty}. Advocates for holistic approaches combining medication management with lifestyle interventions and therapy.',
    'Medical doctor focused on comprehensive mental health treatment. Integrates psychopharmacology with psychotherapy for optimal patient outcomes.',
    'Experienced psychiatrist with expertise in treating complex psychiatric conditions. Committed to personalized, evidence-based treatment planning and patient empowerment.'
  ],
  'Therapist': [
    'Compassionate therapist helping individuals navigate {focus}. Creates safe, supportive therapeutic spaces for healing, growth, and self-discovery.',
    'Integrative therapist combining multiple therapeutic modalities to meet each client\'s unique needs. Passionate about empowering clients on their healing journey.',
    'Licensed therapist specializing in {specialty}. Uses evidence-based approaches tailored to individual client goals, values, and life circumstances.'
  ],
  'Coach': [
    'Certified {type} coach helping clients achieve meaningful goals and lasting change. Uses proven frameworks and supportive accountability to facilitate transformation.',
    'Experienced coach guiding individuals through {focus}. Believes in unlocking each person\'s inherent potential, wisdom, and capacity for growth.',
    'Professional coach specializing in {area}. Combines practical strategies with deep listening to support sustainable personal and professional development.'
  ],
  'Counselor': [
    'Dedicated counselor providing support for {focus}. Offers compassionate, non-judgmental guidance using evidence-based therapeutic approaches.',
    'Experienced counselor helping individuals work through challenges and build resilience. Focuses on strengths-based approaches and empowering clients.',
    'Professional counselor specializing in {specialty}. Creates warm, accepting environments where clients feel safe exploring their experiences and emotions.'
  ],
  'Specialist': [
    'Expert in {specialty} with {years}+ years of specialized experience. Stays current with latest research to provide cutting-edge, evidence-based care.',
    'Dedicated specialist focusing on {area}. Known for compassionate, individualized treatment approaches that honor each person\'s unique journey.',
    'Leading specialist in {field}. Committed to reducing stigma and improving access to high-quality, specialized mental health services.'
  ],
  'Default': [
    'Passionate mental health professional dedicated to supporting individuals on their wellness journey. Combines clinical expertise with genuine compassion and care.',
    'Experienced practitioner committed to holistic mental health and wellbeing. Believes in treating the whole person - mind, body, and spirit.',
    'Dedicated to helping people achieve greater wellbeing and life satisfaction. Uses collaborative, strengths-based approaches that honor client autonomy.'
  ]
};

// 辅助函数：生成slug
function generateSlug(firstName, lastName) {
  return `${firstName}-${lastName}`.toLowerCase().replace(/['\s]/g, '-');
}

// 辅助函数：随机选择
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 辅助函数：生成bio
function generateBio(jobTitle) {
  let templateCategory = 'Default';

  if (jobTitle.includes('Psychologist')) templateCategory = 'Psychologist';
  else if (jobTitle.includes('Meditation') || jobTitle.includes('Mindfulness')) templateCategory = 'Meditation';
  else if (jobTitle.includes('Psychiatrist')) templateCategory = 'Psychiatrist';
  else if (jobTitle.includes('Therapist')) templateCategory = 'Therapist';
  else if (jobTitle.includes('Coach')) templateCategory = 'Coach';
  else if (jobTitle.includes('Counselor')) templateCategory = 'Counselor';
  else if (jobTitle.includes('Specialist')) templateCategory = 'Specialist';

  const templates = bioTemplates[templateCategory];
  let bio = randomChoice(templates);

  // 替换占位符
  bio = bio.replace('{years}', Math.floor(Math.random() * 15) + 5);
  bio = bio.replace('{profession}', randomChoice(['tech executive', 'corporate lawyer', 'healthcare administrator', 'educator', 'entrepreneur', 'financial analyst']));
  bio = bio.replace('{specialty}', randomChoice(['mood disorders', 'anxiety disorders', 'sleep disorders', 'trauma recovery', 'addiction medicine']));
  bio = bio.replace('{focus}', randomChoice(['life transitions', 'relationship challenges', 'personal growth', 'career development', 'stress management']));
  bio = bio.replace('{type}', randomChoice(['life', 'wellness', 'career', 'executive', 'health']));
  bio = bio.replace('{area}', randomChoice(['stress management', 'emotional wellness', 'personal development', 'work-life balance', 'resilience building']));
  bio = bio.replace('{field}', randomChoice(['mental health', 'psychological wellness', 'holistic care', 'integrative therapy', 'behavioral health']));

  return bio;
}

// 辅助函数：生成随机作者
function generateRandomAuthor(usedNames = new Set(), usedSlugs = new Set()) {
  let firstName, lastName, culture, slug;
  let attempts = 0;
  const maxAttempts = 100;

  // 确保生成唯一的名字和slug组合
  do {
    const cultures = Object.keys(firstNames);
    culture = randomChoice(cultures);
    firstName = randomChoice(firstNames[culture]);
    lastName = randomChoice(lastNames[culture]);
    slug = generateSlug(firstName, lastName);
    attempts++;

    // 如果尝试太多次，混合使用不同文化的姓和名
    if (attempts > maxAttempts) {
      const cultureLast = randomChoice(Object.keys(lastNames));
      lastName = randomChoice(lastNames[cultureLast]);
      slug = generateSlug(firstName, lastName);
    }
  } while ((usedNames.has(`${firstName} ${lastName}`) || usedSlugs.has(slug)) && attempts < maxAttempts * 2);

  const fullName = `${firstName} ${lastName}`;
  usedNames.add(fullName);
  usedSlugs.add(slug);

  // 随机决定是否添加头衔 Dr.
  const hasTitle = Math.random() > 0.65; // 35% 概率有Dr.头衔
  const displayName = hasTitle ? `Dr. ${fullName}` : fullName;

  const jobTitle = randomChoice(mentalHealthJobs);
  const bio = generateBio(jobTitle);

  return {
    slug,
    name: displayName,
    job: jobTitle,
    bio
  };
}

// 生成30个随机作者
function generateNewAuthors() {
  const authors = [];
  const usedNames = new Set();
  const usedSlugs = new Set();
  const usedJobs = new Set();

  let attempts = 0;
  const maxAttempts = 1000;

  while (authors.length < 30 && attempts < maxAttempts) {
    const author = generateRandomAuthor(usedNames, usedSlugs);

    // 尝试避免职业重复（但不强制，以防职业库不够大）
    if (usedJobs.has(author.job) && usedJobs.size < mentalHealthJobs.length) {
      attempts++;
      continue;
    }

    usedJobs.add(author.job);
    authors.push(author);
    attempts++;
  }

  return authors;
}

// 生成30个多样化的作者数据（每次执行都不同）
const newAuthors = generateNewAuthors();

/**
 * 备份现有作者
 */
function backupExistingAuthors() {
  log('\n💾 备份现有作者数据...', 'cyan');

  const backupDir = path.join(__dirname, `../backup-authors-${Date.now()}`);

  try {
    if (fs.existsSync(authorsDir)) {
      fs.cpSync(authorsDir, backupDir, { recursive: true });
      log(`✅ 作者数据已备份到: ${path.basename(backupDir)}`, 'green');
      return backupDir;
    }
  } catch (error) {
    log(`⚠️  备份失败: ${error.message}`, 'yellow');
  }

  return null;
}

/**
 * 删除旧的作者目录
 */
function removeOldAuthors() {
  log('\n🗑️  删除旧的作者目录...', 'yellow');

  try {
    if (fs.existsSync(authorsDir)) {
      const authors = fs.readdirSync(authorsDir);
      let count = 0;

      authors.forEach(author => {
        const authorPath = path.join(authorsDir, author);
        if (fs.statSync(authorPath).isDirectory()) {
          fs.rmSync(authorPath, { recursive: true, force: true });
          count++;
        }
      });

      log(`✅ 已删除 ${count} 个旧作者目录`, 'green');
    }
  } catch (error) {
    log(`❌ 删除失败: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * 删除旧的作者头像目录
 */
function removeOldAvatars() {
  log('\n🗑️  删除旧的作者头像...', 'yellow');

  try {
    if (fs.existsSync(assetsDir)) {
      const avatarDirs = fs.readdirSync(assetsDir);
      let count = 0;

      avatarDirs.forEach(dir => {
        const avatarPath = path.join(assetsDir, dir);
        if (fs.statSync(avatarPath).isDirectory()) {
          fs.rmSync(avatarPath, { recursive: true, force: true });
          count++;
        }
      });

      log(`✅ 已删除 ${count} 个旧头像目录`, 'green');
    }
  } catch (error) {
    log(`❌ 删除头像失败: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * 创建单个作者
 */
function createAuthor(author) {
  const authorDir = path.join(authorsDir, author.slug);
  const assetDir = path.join(assetsDir, author.slug);

  // 创建目录
  fs.mkdirSync(authorDir, { recursive: true });
  fs.mkdirSync(assetDir, { recursive: true });

  // 创建MDX文件
  const mdxContent = `---
name: ${author.name}
job: ${author.job}
avatar: '@assets/images/authors/${author.slug}/avatar.jpg'
bio: ${author.bio}
social:
  linkedin: https://linkedin.com/in/${author.slug}
  twitter: https://twitter.com/${author.slug.replace(/-/g, '_')}
---
`;

  const mdxPath = path.join(authorDir, 'index.mdx');
  fs.writeFileSync(mdxPath, mdxContent);

  // 创建占位符头像文件（1x1像素的透明PNG）
  const placeholderAvatar = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );

  const avatarPath = path.join(assetDir, 'avatar.jpg');
  fs.writeFileSync(avatarPath, placeholderAvatar);
}

/**
 * 创建所有新作者
 */
function createAllAuthors() {
  log('\n👥 创建30个新作者...', 'cyan');
  log('=' .repeat(60), 'blue');

  let successCount = 0;
  let failCount = 0;

  newAuthors.forEach((author, index) => {
    try {
      createAuthor(author);
      log(`  ${index + 1}. ✅ ${author.name} (${author.slug})`, 'green');
      successCount++;
    } catch (error) {
      log(`  ${index + 1}. ❌ ${author.slug}: ${error.message}`, 'red');
      failCount++;
    }
  });

  log('\n📊 创建结果:', 'yellow');
  log(`  ✅ 成功: ${successCount} 个作者`, 'green');
  if (failCount > 0) {
    log(`  ❌ 失败: ${failCount} 个作者`, 'red');
  }
  log(`  📝 总计: ${newAuthors.length} 个作者`, 'blue');
}

/**
 * 显示新作者统计信息
 */
function showAuthorStats() {
  log('\n📈 新作者专业领域分布:', 'cyan');
  log('=' .repeat(60), 'blue');

  const jobCategories = {};

  newAuthors.forEach(author => {
    const category = author.job.split('&')[0].trim();
    jobCategories[category] = (jobCategories[category] || 0) + 1;
  });

  Object.entries(jobCategories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      log(`  • ${category}: ${count}`, 'blue');
    });

  log('\n🌍 作者多样性亮点:', 'magenta');
  log('  • 涵盖心理健康、正念、营养、运动等多个领域', 'white');
  log('  • 包含临床专家、教练、治疗师等不同角色', 'white');
  log('  • 代表不同文化背景和专业经验', 'white');
  log('  • 关注特定人群（LGBTQ+、青少年、退伍军人等）', 'white');
}

/**
 * 主函数
 */
async function main() {
  log('\n🎨 创建30个多样化新作者', 'bright');
  log('=' .repeat(60), 'cyan');

  try {
    // 1. 备份现有作者
    const backupDir = backupExistingAuthors();

    // 2. 删除旧作者
    removeOldAuthors();
    removeOldAvatars();

    // 3. 创建新作者
    createAllAuthors();

    // 4. 显示统计信息
    showAuthorStats();

    log('\n✨ 所有新作者创建完成！', 'green');
    log('\n📝 后续步骤:', 'yellow');
    log('  1. 运行: node scripts/randomize-authors.js randomize', 'cyan');
    log('     为所有文章重新分配作者', 'white');
    log('\n  2. 可选: 替换头像图片', 'cyan');
    log(`     位置: src/assets/images/authors/{author-slug}/avatar.jpg`, 'white');

    if (backupDir) {
      log(`\n💡 提示: 如需恢复，备份位于: ${path.basename(backupDir)}`, 'magenta');
    }

  } catch (error) {
    log(`\n❌ 错误: ${error.message}`, 'red');
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
