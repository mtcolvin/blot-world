#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const PHOTOGRAPHY_DIR = path.join(__dirname, '..', 'projects', 'photography', 'images');
const MIN_SIZE_FOR_WEBP = 10 * 1024; // 10KB - skip small images
const JPEG_QUALITY = 85;
const WEBP_QUALITY = 82;
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

async function optimizeImage(filePath, baseDir) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = await getFileSize(filePath);

  // Skip if too small or not JPG/PNG
  if (originalSize < MIN_SIZE_FOR_WEBP || !['.jpg', '.jpeg', '.png'].includes(ext)) {
    return null;
  }

  const webpPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp');
  const stats = { original: originalSize, optimized: 0, webp: 0 };

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Create WebP version (always smaller and better quality)
    if (!fs.existsSync(webpPath)) {
      await image
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(webpPath);
      stats.webp = await getFileSize(webpPath);
      console.log(`✓ Created WebP: ${path.relative(baseDir, webpPath)} (${formatBytes(originalSize)} → ${formatBytes(stats.webp)})`);
    } else {
      stats.webp = await getFileSize(webpPath);
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
      console.log(`✓ Optimized: ${path.relative(baseDir, filePath)} (${formatBytes(originalSize)} → ${formatBytes(optimizedSize)})`);
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

  // Process both main images and photography images
  const directories = [
    { path: IMAGES_DIR, name: 'Main images' },
    { path: PHOTOGRAPHY_DIR, name: 'Photography images' }
  ];

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let totalWebpSize = 0;
  let processedCount = 0;

  for (const dir of directories) {
    if (!fs.existsSync(dir.path)) {
      console.log(`⚠️  Skipping ${dir.name} - directory not found\n`);
      continue;
    }

    console.log(`📁 Processing ${dir.name}...`);

    const imagePatterns = ['**/*.jpg', '**/*.jpeg', '**/*.png'];
    const allImages = [];

    for (const pattern of imagePatterns) {
      const files = await glob(pattern, { cwd: dir.path, absolute: true });
      allImages.push(...files);
    }

    console.log(`   Found ${allImages.length} images\n`);

    for (const imagePath of allImages) {
      const result = await optimizeImage(imagePath, dir.path);
      if (result) {
        totalOriginalSize += result.original;
        totalOptimizedSize += result.optimized;
        totalWebpSize += result.webp;
        processedCount++;
      }
    }

    console.log('');
  }

  const originalSavings = totalOriginalSize - totalOptimizedSize;
  const webpSavings = totalOriginalSize - totalWebpSize;

  console.log('\n📊 Summary:');
  console.log(`   Processed: ${processedCount} images`);
  console.log(`   Original total size: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Optimized total size: ${formatBytes(totalOptimizedSize)} (saved ${formatBytes(originalSavings)})`);
  console.log(`   WebP total size: ${formatBytes(totalWebpSize)} (saved ${formatBytes(webpSavings)} vs original)`);
  console.log(`   Savings: ${Math.round((originalSavings / totalOriginalSize) * 100)}% from optimization, ${Math.round((webpSavings / totalOriginalSize) * 100)}% with WebP`);
}

main().catch(console.error);
