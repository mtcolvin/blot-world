const sharp = require('sharp');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

const TARGET_WIDTH = 1200;
const QUALITY = 85;
const imagesDir = path.join(__dirname, '..', 'projects', 'photography', 'images');

async function resizePhotos() {
    console.log('📷 Resizing photos for IP protection...\n');
    console.log(`Target width: ${TARGET_WIDTH}px, Quality: ${QUALITY}%\n`);

    const imageFiles = await glob('*.{jpg,JPG,jpeg,JPEG,png,PNG}', {
        cwd: imagesDir
    });

    if (imageFiles.length === 0) {
        console.log('No images found.');
        return;
    }

    let resizedCount = 0;
    let skippedCount = 0;

    for (const file of imageFiles) {
        const filePath = path.join(imagesDir, file);

        try {
            // Read file into buffer first (works better with OneDrive)
            const inputBuffer = fs.readFileSync(filePath);
            const metadata = await sharp(inputBuffer).metadata();

            if (metadata.width > TARGET_WIDTH) {
                const newHeight = Math.round((TARGET_WIDTH / metadata.width) * metadata.height);

                // Read, resize, and save with EXIF preserved
                const outputBuffer = await sharp(inputBuffer)
                    .resize(TARGET_WIDTH, newHeight, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .withMetadata() // Preserves EXIF data
                    .jpeg({ quality: QUALITY })
                    .toBuffer();

                fs.writeFileSync(filePath, outputBuffer);

                console.log(`✓ ${file}: ${metadata.width}x${metadata.height} → ${TARGET_WIDTH}x${newHeight}`);
                resizedCount++;
            } else {
                console.log(`· ${file}: ${metadata.width}x${metadata.height} (already ≤${TARGET_WIDTH}px)`);
                skippedCount++;
            }
        } catch (error) {
            console.error(`✗ ${file}: ${error.message}`);
        }
    }

    console.log(`\n✅ Done: ${resizedCount} resized, ${skippedCount} skipped`);
}

resizePhotos();
