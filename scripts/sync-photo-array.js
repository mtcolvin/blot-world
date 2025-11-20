const { exiftool } = require('exiftool-vendored');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '..', 'projects', 'photography', 'images');
const photoLoaderPath = path.join(__dirname, '..', 'projects', 'photography', 'photo-loader.js');

async function syncPhotoArray() {
    try {
        console.log('📸 Scanning images folder...\n');

        // Find all image files
        const imageFiles = await glob('*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}', {
            cwd: imagesDir
        });

        if (imageFiles.length === 0) {
            console.error('❌ No image files found in', imagesDir);
            process.exit(1);
        }

        console.log(`Found ${imageFiles.length} images\n`);

        // Extract metadata from each image
        const photoEntries = [];
        for (const file of imageFiles) {
            const filePath = path.join(imagesDir, file);
            let date = null;

            // First, check if there's a corresponding HEIC file with the same base name
            const baseName = file.replace(/\.(jpg|JPG|jpeg|JPEG)$/, '');
            const heicPath = path.join(imagesDir, baseName + '.HEIC');

            let sourceFile = filePath;
            if (fs.existsSync(heicPath)) {
                sourceFile = heicPath;
                console.log(`  Using HEIC file for date: ${baseName}.HEIC`);
            }

            try {
                const metadata = await exiftool.read(sourceFile);

                // Try different date fields
                if (metadata.DateTimeOriginal) {
                    date = formatDate(metadata.DateTimeOriginal);
                }
                if (!date && metadata.CreateDate) {
                    date = formatDate(metadata.CreateDate);
                }
                if (!date && metadata.ModifyDate) {
                    date = formatDate(metadata.ModifyDate);
                }
            } catch (error) {
                console.warn(`⚠ Could not read metadata for ${file}`);
            }

            // Fallback to file modification time if no EXIF date found
            if (!date) {
                const stats = fs.statSync(filePath);
                date = stats.mtime.toISOString().split('T')[0];
                console.log(`✓ ${file} → ${date} (from file mtime)`);
            } else {
                console.log(`✓ ${file} → ${date}`);
            }

            photoEntries.push({ file, date });
        }

        // Sort by date (oldest first)
        photoEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Generate the photos array code
        const photosArrayCode = `const photos = [\n${photoEntries.map(entry =>
            `    { file: '${entry.file}', date: '${entry.date}' }`
        ).join(',\n')}\n];`;

        // Read the current photo-loader.js
        let photoLoaderContent = fs.readFileSync(photoLoaderPath, 'utf8');

        // Replace the photos array
        const photosArrayRegex = /const photos = \[[\s\S]*?\];/;
        if (!photosArrayRegex.test(photoLoaderContent)) {
            console.error('❌ Could not find photos array in photo-loader.js');
            process.exit(1);
        }

        photoLoaderContent = photoLoaderContent.replace(photosArrayRegex, photosArrayCode);

        // Write back to file
        fs.writeFileSync(photoLoaderPath, photoLoaderContent, 'utf8');

        console.log('\n✅ Successfully updated photo-loader.js!');
        console.log(`\nGenerated array with ${photoEntries.length} photos`);
        console.log('First photo:', photoEntries[0].file, '→', photoEntries[0].date);
        console.log('Last photo:', photoEntries[photoEntries.length - 1].file, '→', photoEntries[photoEntries.length - 1].date);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await exiftool.end();
    }
}

function formatDate(dateValue) {
    if (!dateValue) return null;

    // Handle ExifDateTime objects (from exiftool-vendored)
    if (dateValue.year && dateValue.month && dateValue.day) {
        const year = dateValue.year;
        const month = String(dateValue.month).padStart(2, '0');
        const day = String(dateValue.day).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Handle Date objects
    if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
    }

    // Handle string dates in format "YYYY:MM:DD HH:MM:SS"
    if (typeof dateValue === 'string') {
        const match = dateValue.match(/(\d{4}):(\d{2}):(\d{2})/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
    }

    return null;
}

syncPhotoArray();
