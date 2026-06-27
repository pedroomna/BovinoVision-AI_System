import * as Jimp from 'jimp';
import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'Protótipo das telas');
const outDir = path.join(process.cwd(), 'docs', 'thumbs');

await fs.promises.mkdir(outDir, { recursive: true });

const files = await fs.promises.readdir(srcDir);
const allowed = ['.png', '.jpg', '.jpeg', '.webp'];

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!allowed.includes(ext)) continue;
  try {
    const imgPath = path.join(srcDir, file);
    const image = await Jimp.read(imgPath);
    const outPath = path.join(outDir, file);
    await image.resize(300, Jimp.AUTO).quality(70).writeAsync(outPath);
    console.log('Created thumbnail:', outPath);
  } catch (err) {
    console.error('Failed processing', file, err);
  }
}

console.log('Thumbnails generated in', outDir);
