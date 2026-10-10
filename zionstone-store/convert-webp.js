const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const { glob } = require('glob');

async function main() {
  const root = path.resolve('/home/jacobp/Desktop/Projecs/zionstone-electro-musical');
  const dir = path.join(root, 'public/images/zionstone');
  const files = await glob('**/*.png', { cwd: dir });
  let before = 0, after = 0;
  let converted = 0;
  for (const rel of files) {
    const full = path.join(dir, rel);
    const out = full.replace(/\.png$/, '.webp');
    const buf = await fs.readFile(full);
    before += buf.length;
    const res = await sharp(buf, { animated: false })
      .autoOrient()
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    if (res.length >= buf.length && buf.length < 200 * 1024) {
      await fs.copyFile(full, out);
      after += buf.length;
    } else {
      await fs.writeFile(out, res);
      after += res.length;
    }
    await fs.unlink(full);
    converted++;
  }
  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  console.log(`converted=${converted} before=${mb(before)}MB after=${mb(after)}MB`);
}

main().catch((e) => { console.error(e); process.exit(1); });