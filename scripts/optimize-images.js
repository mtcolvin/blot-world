#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const MIN_SIZE_FOR_AVIF = 10 * 1024; // 10KB - skip small images
const JPEG_QUALITY = 85;
const AVIF_QUALITY = 65; // AVIF at 65 ≈ WebP at 82, but ~30-50% smaller
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
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = await getFileSize(filePath);

  // Skip if too small or not JPG/PNG
  if (originalSize < MIN_SIZE_FOR_AVIF || !['.jpg', '.jpeg', '.png'].includes(ext)) {
    return null;
  }

  const avifPath = filePath.replace(/\.(jpe?g|png)$/i, '.avif');
  const stats = { original: originalSize, optimized: 0, avif: 0 };

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Create AVIF version (better compression than WebP)
    if (!fs.existsSync(avifPath)) {
      await image
        .avif({ quality: AVIF_QUALITY, effort: 6 })
        .toFile(avifPath);
      stats.avif = await getFileSize(avifPath);
      console.log(`✓ Created AVIF: ${path.relative(IMAGES_DIR, avifPath)} (${formatBytes(originalSize)} → ${formatBytes(stats.avif)})`);
    }

    // Optimize the original file
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
      console.log(`✓ Optimized: ${path.relative(IMAGES_DIR, filePath)} (${formatBytes(originalSize)} → ${formatBytes(optimizedSize)})`);
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

  // Find all images
  const imagePatterns = ['**/*.jpg', '**/*.jpeg', '**/*.png'];
  const allImages = [];

  for (const pattern of imagePatterns) {
    const files = await glob(pattern, { cwd: IMAGES_DIR, absolute: true });
    allImages.push(...files);
  }

  console.log(`Found ${allImages.length} images to process\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let totalAvifSize = 0;
  let processedCount = 0;

  for (const imagePath of allImages) {
    const result = await optimizeImage(imagePath);
    if (result) {
      totalOriginalSize += result.original;
      totalOptimizedSize += result.optimized;
      totalAvifSize += result.avif;
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
  console.log(`   Savings: ${Math.round((originalSavings / totalOriginalSize) * 100)}% from optimization, ${Math.round((avifSavings / totalOriginalSize) * 100)}% with AVIF`);
}

main().catch(console.error);
