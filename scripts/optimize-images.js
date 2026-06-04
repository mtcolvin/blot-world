#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');
const { isSkipped } = require('./lib/skip-list');

const ROOT_DIR = path.join(__dirname, '..');
// Scan top-level images/ AND each self-contained projects/<slug>/ folder, where
// project previews + content images live after the single-source refactor.
const SCAN_DIRS = ['images', 'projects'];
const MIN_SIZE = 10 * 1024; // 10KB - skip tiny images (icons/favicons)
const JPEG_QUALITY = 85;
const AVIF_QUALITY = 65; // AVIF at 65 ≈ WebP at 82, but ~30-50% smaller
const WEBP_QUALITY = 82; // universal fallback for browsers without AVIF
const PNG_QUALITY = 85;

async function getFileSize(filePath) {
  const stats = await fs.promises.stat(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function optimizeImage(filePath) {
  // Flat brand graphics opted out via data/no-optimize.json — leave pristine.
  if (isSkipped(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  const originalSize = await getFileSize(filePath);

  // Card previews are always served via <picture> (JS-rendered, emits AVIF
  // unconditionally), so they must have siblings even when under the size floor.
  const isPreview = /^preview\.(jpe?g|png)$/i.test(path.basename(filePath));
  // Skip if too small or not JPG/PNG (but never skip a preview).
  if ((originalSize < MIN_SIZE && !isPreview) || !['.jpg', '.jpeg', '.png'].includes(ext)) {
    return null;
  }

  const avifPath = filePath.replace(/\.(jpe?g|png)$/i, '.avif');
  const webpPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp');
  const stats = { original: originalSize, optimized: 0, avif: 0, webp: 0 };

  try {
    // Create AVIF version (best compression, served first in <picture>)
    if (!fs.existsSync(avifPath)) {
      await sharp(filePath)
        .avif({ quality: AVIF_QUALITY, effort: 6 })
        .toFile(avifPath);
      console.log(`✓ AVIF: ${path.relative(ROOT_DIR, avifPath)} (${formatBytes(originalSize)} → ${formatBytes(await getFileSize(avifPath))})`);
    }
    stats.avif = fs.existsSync(avifPath) ? await getFileSize(avifPath) : 0;

    // Create WebP version (fallback for browsers without AVIF)
    if (!fs.existsSync(webpPath)) {
      await sharp(filePath)
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);
      console.log(`✓ WebP: ${path.relative(ROOT_DIR, webpPath)} (${formatBytes(originalSize)} → ${formatBytes(await getFileSize(webpPath))})`);
    }
    stats.webp = fs.existsSync(webpPath) ? await getFileSize(webpPath) : 0;

    // Optimize the original file (this is what <img> fallback serves)
    const tempPath = filePath + '.tmp';

    if (ext === '.png') {
      await sharp(filePath)
        .png({ quality: PNG_QUALITY, compressionLevel: 9, effort: 10 })
        .toFile(tempPath);
    } else {
      await sharp(filePath)
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(tempPath);
    }

    const optimizedSize = await getFileSize(tempPath);

    // Only replace if we achieved meaningful compression (>5% reduction)
    if (optimizedSize < originalSize * 0.95) {
      await fs.promises.rename(tempPath, filePath);
      stats.optimized = optimizedSize;
      console.log(`✓ Optimized: ${path.relative(ROOT_DIR, filePath)} (${formatBytes(originalSize)} → ${formatBytes(optimizedSize)})`);
    } else {
      await fs.promises.unlink(tempPath);
      stats.optimized = originalSize;
    }

    return stats;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');

  // Find all images across every scan directory
  const imagePatterns = ['**/*.jpg', '**/*.jpeg', '**/*.png'];
  const allImages = [];

  for (const dir of SCAN_DIRS) {
    for (const pattern of imagePatterns) {
      const files = await glob(pattern, {
        cwd: path.join(ROOT_DIR, dir),
        absolute: true,
        nodir: true,
      });
      allImages.push(...files);
    }
  }

  console.log(`Found ${allImages.length} images to process\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let totalAvifSize = 0;
  let totalWebpSize = 0;
  let processedCount = 0;

  for (const imagePath of allImages) {
    const result = await optimizeImage(imagePath);
    if (result) {
      totalOriginalSize += result.original;
      totalOptimizedSize += result.optimized;
      totalAvifSize += result.avif;
      totalWebpSize += result.webp;
      processedCount++;
    }
  }

  const originalSavings = totalOriginalSize - totalOptimizedSize;
  const avifSavings = totalOriginalSize - totalAvifSize;

  console.log('\n📊 Summary:');
  console.log(`   Processed: ${processedCount} images`);
  console.log(`   Original total size: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Optimized total size: ${formatBytes(totalOptimizedSize)} (saved ${formatBytes(originalSavings)})`);
  console.log(`   AVIF total size: ${formatBytes(totalAvifSize)} (saved ${formatBytes(avifSavings)} vs original)`);
  console.log(`   WebP total size: ${formatBytes(totalWebpSize)}`);
  console.log(`   Savings: ${Math.round((originalSavings / totalOriginalSize) * 100)}% from optimization, ${Math.round((avifSavings / totalOriginalSize) * 100)}% with AVIF`);
}

main().catch(console.error);
