const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceFile = path.join(__dirname, '..', 'images', 'favicon', 'favicon-96x96.png');
const outputDir = path.join(__dirname, '..', 'images', 'favicon');

async function createFaviconSizes() {
    try {
        // Create 16x16
        await sharp(sourceFile)
            .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(outputDir, 'favicon-16x16.png'));
        console.log('✓ Created favicon-16x16.png');

        // Create 32x32
        await sharp(sourceFile)
            .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(outputDir, 'favicon-32x32.png'));
        console.log('✓ Created favicon-32x32.png');

        console.log('\nFavicon sizes created successfully!');
    } catch (error) {
        console.error('Error creating favicon sizes:', error);
        process.exit(1);
    }
}

createFaviconSizes();
