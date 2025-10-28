# Author System Structure Documentation

## 📚 Overview

This project implements a sophisticated author management system with **30 diverse authors** who contribute articles on wellness, psychology, meditation, and mindfulness topics. The system supports smart random assignment, AI-generated professional avatars, and comprehensive author profiles.

---

## 🎭 Author Pool (30 Total)

### Author Categories by Specialty

#### **Clinical Psychology & Therapy**
- **Dr. Sarah Chen** - Clinical Psychologist & Wellness Expert (CBT, mindfulness-based stress reduction)
- **Dr. Lisa Mueller** - Clinical Psychologist (trauma-focused therapy, EMDR)
- **Dr. Elena Petrov** - Clinical Psychologist (depression, anxiety disorders)
- **Dr. Nina Ivanova** - Psychiatrist & Mental Health Advocate (medication management, holistic psychiatry)

#### **Meditation & Mindfulness**
- **Marcus Williams** - Meditation Teacher & Mindfulness Coach (Vipassana meditation)
- **Aisha Patel** - Yoga Instructor & Mindfulness Expert (vinyasa yoga, pranayama)
- **Yuki Tanaka** - Zen Meditation Teacher (Japanese Zen traditions)
- **Priya Sharma** - Mindfulness-Based Stress Reduction Instructor

#### **Holistic Wellness**
- **David Thompson** - Holistic Health Coach (integrative nutrition, lifestyle medicine)
- **Jennifer Rodriguez** - Integrative Wellness Coach (mind-body connection, stress management)
- **Sofia Morales** - Holistic Nutritionist (plant-based nutrition, gut health)

#### **Specialized Therapy**
- **Dr. Rahman Ali** - Psychiatrist & Sleep Medicine Specialist (insomnia, sleep disorders)
- **Anna Kowalski** - Art Therapist (creative expression therapy)
- **Maya Desai** - Dance Movement Therapist (somatic experiencing)

#### **Fitness & Movement**
- **James O'Connor** - Fitness Coach & Mental Health Advocate (exercise psychology)
- **Tyler Anderson** - Personal Trainer & Wellness Coach (strength training, functional fitness)
- **Ethan Parker** - Sports Psychologist (performance optimization)

#### **Counseling & Social Work**
- **Michael Jenkins** - Licensed Professional Counselor (anxiety, depression)
- **Jordan Davis** - Licensed Clinical Social Worker (trauma, grief counseling)
- **Rachel Goldstein** - Licensed Marriage & Family Therapist (couples therapy, attachment theory)
- **Samuel Brown** - Career Counselor & Life Coach (work-life balance, burnout prevention)

#### **Alternative & Integrative Medicine**
- **Kevin Zhang** - Traditional Chinese Medicine Practitioner (acupuncture, herbal medicine)
- **Dr. Ahmed Abdullah** - Integrative Medicine Physician (functional medicine)
- **Carlos Santiago** - Meditation Teacher & Breathwork Facilitator (Wim Hof Method, holotropic breathwork)

#### **Specialized Wellness**
- **Mei-Ling Wong** - Tai Chi Instructor & Qigong Master
- **Fatima Hassan** - Nutritionist & Wellness Writer (Mediterranean diet, anti-inflammatory nutrition)
- **Ryan Cooper** - Mindfulness & Productivity Coach (time management, focus optimization)
- **Isabella Rossi** - Sound Healing Practitioner (sound therapy, crystal bowls)
- **Daniel Kim** - Mindfulness Educator (workplace wellness, corporate mindfulness programs)
- **Olivia Bennett** - Positive Psychology Coach (strengths-based approach, gratitude practices)

---

## 📁 File Structure

```
src/
├── content/
│   └── authors/
│       ├── sarah-chen/
│       │   ├── index.mdx          # Author profile (YAML frontmatter)
│       │   └── (avatar handled separately)
│       ├── marcus-williams/
│       │   └── index.mdx
│       ├── aisha-patel/
│       │   └── index.mdx
│       └── ... (30 total)
│
├── assets/
│   └── images/
│       └── authors/
│           ├── sarah-chen/
│           │   └── avatar.jpg     # AI-generated professional headshot
│           ├── marcus-williams/
│           │   └── avatar.jpg
│           └── ... (30 total)
│
author/
└── name.txt                       # Assignment mode: "random" or specific author slug

scripts/
├── create-30-diverse-authors.js   # Author creation script
├── generate-author-avatars.js     # DALL-E avatar generation
└── randomize-authors.js           # Smart random assignment
```

---

## 👤 Author Profile Structure

Each author has a dedicated MDX file with YAML frontmatter:

```yaml
---
name: Dr. Sarah Chen
job: Clinical Psychologist & Wellness Expert
avatar: '@assets/images/authors/sarah-chen/avatar.jpg'
bio: Specializes in cognitive behavioral therapy and mindfulness-based stress reduction. With over 15 years of clinical experience, Sarah helps individuals develop sustainable mental health practices.
social:
  linkedin: https://linkedin.com/in/sarah-chen
  twitter: https://twitter.com/sarah_chen
---
```

### **Field Descriptions**

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full author name (with title if applicable) |
| `job` | String | Professional title and specialty area |
| `avatar` | String | Path to author's avatar image (Astro asset path) |
| `bio` | String | 2-3 sentence professional biography |
| `social` | Object | Social media links (linkedin, twitter, website) |

---

## 🔄 Author Assignment System

### **Assignment Mode Configuration**

The `author/name.txt` file controls how authors are assigned to articles:

- **`random`** - Smart random assignment with distribution logic
- **`[author-slug]`** - Fixed author for all articles (e.g., `sarah-chen`)

**Current mode**: `random`

### **Smart Random Assignment Algorithm**

Located in [scripts/randomize-authors.js](scripts/randomize-authors.js):

```javascript
function getRandomAuthor(authors, lastAuthor = null, usedAuthors = []) {
    // 1. Reset pool if all authors have been used
    if (usedAuthors.length >= authors.length) {
        usedAuthors = [];
    }

    // 2. Filter out recently used authors
    let availableAuthors = authors.filter(author =>
        author.slug !== lastAuthor && !usedAuthors.includes(author.slug)
    );

    // 3. Randomly select from available pool
    const randomIndex = Math.floor(Math.random() * availableAuthors.length);
    return availableAuthors[randomIndex];
}

function randomizeAllAuthors() {
    let lastAuthor = null;
    let usedAuthors = [];

    for (const article of articles) {
        const selectedAuthor = getRandomAuthor(authors, lastAuthor, usedAuthors);
        updateArticleAuthor(article.path, selectedAuthor.slug);

        lastAuthor = selectedAuthor.slug;
        usedAuthors.push(selectedAuthor.slug);

        // Reset every 3 authors for more randomness
        if (usedAuthors.length >= Math.min(3, authors.length)) {
            usedAuthors = [];
        }
    }
}
```

**Key Features**:
- ✅ Avoids consecutive repeats (same author back-to-back)
- ✅ Maintains diversity by rotating through author pool
- ✅ Resets every 3 authors to prevent predictability
- ✅ Handles edge cases (fewer authors than articles)

---

## 🎨 Avatar Generation System

### **AI-Generated Professional Headshots**

Located in [scripts/generate-author-avatars.js](scripts/generate-author-avatars.js):

**Technology**: OpenAI DALL-E 3 (1024x1024px, high quality)

**Prompt Structure**:
```javascript
const authorAvatarPrompts = [
    {
        slug: 'sarah-chen',
        name: 'Dr. Sarah Chen',
        gender: 'female',
        ethnicity: 'East Asian',
        age: '35-45',
        profession: 'Clinical Psychologist',
        prompt: 'Professional headshot of an Asian female clinical psychologist in her 40s, warm and approachable expression, wearing professional attire, neutral background, natural lighting, high-quality portrait photography'
    },
    // ... 30 detailed prompts
];
```

**Prompt Guidelines**:
- Professional business attire
- Warm and approachable expression
- Neutral/clean background
- Natural studio lighting
- High-quality portrait photography style
- Age-appropriate appearance
- Culturally authentic representation

**Generation Process**:
1. Sends detailed prompt to DALL-E 3
2. Downloads 1024x1024px PNG image
3. Saves to `src/assets/images/authors/[author-slug]/avatar.jpg`
4. Validates file size and format

---

## 📊 Current Distribution Statistics

**Analysis Date**: 2025-10-23
**Command**: `node scripts/randomize-authors.js analyze`

### **Article Distribution**

- **Total Articles**: 40
- **Authors Used**: 22 out of 30 (73%)
- **Authors Unused**: 8 (27%)

### **Top Contributors**

| Rank | Author | Articles |
|------|--------|----------|
| 1 | Jordan Davis | 3 |
| 2 | Dr. Lisa Mueller | 3 |
| 3 | Dr. Nina Ivanova | 3 |
| 4 | Anna Kowalski | 2 |
| 5 | Carlos Santiago | 2 |
| 6 | Daniel Kim | 2 |
| 7 | David Thompson | 2 |
| 8 | Dr. Elena Petrov | 2 |
| 9 | Fatima Hassan | 2 |
| 10 | Isabella Rossi | 2 |

### **Currently Unassigned Authors** (0 articles)

1. Ahmed Abdullah
2. Ethan Parker
3. Kevin Zhang
4. Mei-Ling Wong
5. Priya Sharma
6. Rachel Goldstein
7. Dr. Rahman Ali
8. Dr. Sarah Chen

---

## 🛠️ Management Commands

### **Analyze Current Distribution**

```bash
node scripts/randomize-authors.js analyze
```

**Output**:
- Total article count
- Distribution by author
- Authors with no assignments
- Recommendations for rebalancing

### **Randomize All Authors**

```bash
node scripts/randomize-authors.js
```

**What it does**:
- Reassigns all articles to random authors
- Uses smart distribution algorithm
- Avoids consecutive repeats
- Updates article frontmatter

### **Generate Author Avatars**

```bash
node scripts/generate-author-avatars.js
```

**What it does**:
- Generates professional headshots via DALL-E 3
- Saves to author avatar directories
- Creates 1024x1024px high-quality images
- Skips existing avatars (unless forced)

**Options**:
```bash
node scripts/generate-author-avatars.js --force    # Regenerate all avatars
node scripts/generate-author-avatars.js --author=sarah-chen  # Single author
```

### **Create New Authors**

```bash
node scripts/create-30-diverse-authors.js
```

**What it does**:
- Creates all 30 author directories
- Generates MDX profile files
- Sets up avatar directories
- Validates structure

---

## 🎯 Diversity & Representation

The author pool intentionally includes:

### **Ethnic Diversity**
- East Asian (4): Sarah Chen, Yuki Tanaka, Kevin Zhang, Mei-Ling Wong
- South Asian (3): Aisha Patel, Priya Sharma, Maya Desai
- African American (2): Marcus Williams, Jordan Davis
- Hispanic/Latino (3): Jennifer Rodriguez, Sofia Morales, Carlos Santiago
- Middle Eastern/Arab (2): Dr. Rahman Ali, Fatima Hassan, Ahmed Abdullah
- Eastern European (3): Dr. Elena Petrov, Anna Kowalski, Dr. Nina Ivanova
- Mediterranean (1): Isabella Rossi
- Caucasian (12): David Thompson, James O'Connor, Michael Jenkins, Dr. Lisa Mueller, Tyler Anderson, Ryan Cooper, Daniel Kim, Olivia Bennett, Rachel Goldstein, Samuel Brown, Ethan Parker

### **Gender Balance**
- Female: 16 (53%)
- Male: 14 (47%)

### **Professional Diversity**
- Medical Doctors/Psychiatrists: 4
- Psychologists/Therapists: 8
- Meditation/Yoga Teachers: 5
- Nutritionists/Health Coaches: 4
- Fitness/Movement Specialists: 4
- Alternative Medicine: 3
- Counselors/Social Workers: 2

### **Age Representation**
- 30-40 years: 12 authors
- 40-50 years: 12 authors
- 50-60 years: 6 authors

---

## 🔧 Customization Guide

### **Add a New Author**

1. **Create author directory**:
   ```bash
   mkdir -p "src/content/authors/new-author"
   mkdir -p "src/assets/images/authors/new-author"
   ```

2. **Create `index.mdx`**:
   ```yaml
   ---
   name: Dr. Jane Doe
   job: Mindfulness Expert
   avatar: '@assets/images/authors/new-author/avatar.jpg'
   bio: Your professional biography here.
   social:
     linkedin: https://linkedin.com/in/jane-doe
     twitter: https://twitter.com/jane_doe
   ---
   ```

3. **Generate avatar**:
   ```bash
   node scripts/generate-author-avatars.js --author=new-author
   ```

4. **Update author list** in `create-30-diverse-authors.js` (optional)

### **Change Assignment Mode**

Edit `author/name.txt`:

- For random: `random`
- For fixed author: `sarah-chen` (or any author slug)

### **Rebalance Distribution**

If some authors are over-represented:

```bash
node scripts/randomize-authors.js analyze    # Check current distribution
node scripts/randomize-authors.js           # Randomize all assignments
```

---

## 📖 Integration with Articles

### **Article Frontmatter**

Articles reference authors by slug:

```yaml
---
title: "Understanding Mindfulness Meditation"
description: "A comprehensive guide to mindfulness practices"
author: sarah-chen                # Author slug
pubDate: 2025-01-15
category: meditation
---
```

### **Author Data Access in Astro**

```astro
---
import { getEntry } from 'astro:content';

const author = await getEntry('authors', 'sarah-chen');
---

<div class="author-card">
  <img src={author.data.avatar} alt={author.data.name} />
  <h3>{author.data.name}</h3>
  <p>{author.data.job}</p>
  <p>{author.data.bio}</p>
</div>
```

---

## 🎨 Avatar Quality Standards

All avatars must meet these criteria:

- **Resolution**: 1024x1024px minimum
- **Format**: JPG or PNG
- **File size**: < 500KB (optimized)
- **Style**: Professional headshot
- **Background**: Neutral/clean
- **Lighting**: Natural, well-lit
- **Expression**: Warm, approachable, professional
- **Attire**: Professional business casual
- **Framing**: Shoulders and head visible

---

## 🚀 Best Practices

### **When to Randomize Authors**

✅ **Do randomize when**:
- Publishing new batch of articles
- Rebalancing over-represented authors
- Starting a new content calendar

❌ **Don't randomize when**:
- Articles already published (breaks attribution)
- SEO/backlinks rely on specific author pages
- Author branding is established

### **Maintaining Author Authenticity**

- Keep bios realistic and professional
- Ensure social links match professional tone
- Update avatars if regenerating (maintain consistency)
- Match article topics to author specialties

### **Performance Optimization**

- Generate avatars once, not repeatedly
- Use cached images in production
- Optimize avatar file sizes for web
- Lazy load author images on article pages

---

## 📝 File References

- Author profiles: [src/content/authors/](src/content/authors/)
- Avatar images: [src/assets/images/authors/](src/assets/images/authors/)
- Assignment mode: [author/name.txt](author/name.txt)
- Randomization script: [scripts/randomize-authors.js](scripts/randomize-authors.js)
- Avatar generator: [scripts/generate-author-avatars.js](scripts/generate-author-avatars.js)
- Author creation: [scripts/create-30-diverse-authors.js](scripts/create-30-diverse-authors.js)

---

## 🎓 Summary

The author system provides:

✅ **30 diverse professional authors** with varied backgrounds
✅ **Smart random assignment** avoiding consecutive repeats
✅ **AI-generated avatars** via DALL-E 3
✅ **Comprehensive profiles** with bio and social links
✅ **Easy management** with CLI commands
✅ **Flexible assignment modes** (random or fixed)
✅ **Distribution analytics** for content balancing

This system ensures your wellness blog has authentic, diverse, and professional author representation while maintaining easy content management and scalability.
