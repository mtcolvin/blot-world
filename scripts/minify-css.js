#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csso = require('csso');
const { glob } = require('glob');

const ROOT_DIR = path.join(__dirname, '..');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function minifyCSS(filePath) {
  try {
    const originalCSS = await fs.promises.readFile(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalCSS, 'utf8');

    // Minify CSS
    const result = csso.minify(originalCSS, {
      filename: filePath,
      sourceMap: false
    });

    const minifiedCSS = result.css;
    const minifiedSize = Buffer.byteLength(minifiedCSS, 'utf8');

    // Create .min.css version
    const minPath = filePath.replace(/\.css$/, '.min.css');
    await fs.promises.writeFile(minPath, minifiedCSS, 'utf8');

    const savings = originalSize - minifiedSize;
    const percent = Math.round((savings / originalSize) * 100);

    console.log(`✓ ${path.relative(ROOT_DIR, filePath)}`);
    console.log(`  ${formatBytes(originalSize)} → ${formatBytes(minifiedSize)} (${percent}% reduction)`);

    return { originalSize, minifiedSize };
  } catch (error) {
    console.error(`✗ Error minifying ${filePath}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🎨 Starting CSS minification...\n');

  // Find all CSS files (exclude already minified ones)
  const cssFiles = await glob('**/*.css', {
    cwd: ROOT_DIR,
    absolute: true,
    ignore: ['node_modules/**', '**/*.min.css']
  });

  console.log(`Found ${cssFiles.length} CSS files to minify\n`);

  let totalOriginalSize = 0;
  let totalMinifiedSize = 0;

  for (const cssPath of cssFiles) {
    const result = await minifyCSS(cssPath);
    if (result) {
      totalOriginalSize += result.originalSize;
      totalMinifiedSize += result.minifiedSize;
    }
  }

  const totalSavings = totalOriginalSize - totalMinifiedSize;
  const totalPercent = Math.round((totalSavings / totalOriginalSize) * 100);

  console.log('\n📊 Summary:');
  console.log(`   Total original size: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Total minified size: ${formatBytes(totalMinifiedSize)}`);
  console.log(`   Total savings: ${formatBytes(totalSavings)} (${totalPercent}% reduction)`);
}

main().catch(console.error);
