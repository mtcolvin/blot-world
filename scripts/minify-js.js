#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const { glob } = require('glob');

const ROOT_DIR = path.join(__dirname, '..');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function minifyJS(filePath) {
  try {
    const originalJS = await fs.promises.readFile(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalJS, 'utf8');

    // Minify JavaScript
    const result = await minify(originalJS, {
      compress: {
        dead_code: true,
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        pure_funcs: [],
        passes: 2
      },
      mangle: {
        toplevel: false,
        keep_classnames: true,
        keep_fnames: false
      },
      format: {
        comments: false
      },
      sourceMap: false
    });

    if (result.error) {
      throw result.error;
    }

    const minifiedJS = result.code;
    const minifiedSize = Buffer.byteLength(minifiedJS, 'utf8');

    // Create .min.js version
    const minPath = filePath.replace(/\.js$/, '.min.js');
    await fs.promises.writeFile(minPath, minifiedJS, 'utf8');

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
  console.log('⚡ Starting JavaScript minification...\n');

  // Find all JS files (exclude already minified ones and node_modules)
  const jsFiles = await glob('**/*.js', {
    cwd: ROOT_DIR,
    absolute: true,
    ignore: ['node_modules/**', 'scripts/**', '**/*.min.js']
  });

  console.log(`Found ${jsFiles.length} JavaScript files to minify\n`);

  let totalOriginalSize = 0;
  let totalMinifiedSize = 0;

  for (const jsPath of jsFiles) {
    const result = await minifyJS(jsPath);
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
