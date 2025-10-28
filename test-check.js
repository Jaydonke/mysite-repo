const fs = require('fs');
const path = require('path');

const testDir = path.join('e:', 'astro', 'astrotemp', 'src', 'assets', 'images', 'articles', 'how-to-build-a-beautiful-garden');

const images = ['cover.png', 'img_0.jpg'];

for (const img of images) {
  const imgPath = path.join(testDir, img);
  if (fs.existsSync(imgPath)) {
    const buffer = fs.readFileSync(imgPath);
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    console.log(`${img}: size=${buffer.length}, isPNG=${isPNG}, isJPEG=${isJPEG}, corrupted=${!(isPNG || isJPEG)}`);
  } else {
    console.log(`${img}: missing`);
  }
}
