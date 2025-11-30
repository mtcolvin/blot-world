const { exiftool } = require('exiftool-vendored');
const path = require('path');
const fs = require('fs');

const imagePath = path.join(__dirname, '..', 'projects', 'photography', 'images', 'vlcsnap-2025-11-12-02h05m05s496.jpg');

async function addMetadata() {
    try {
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            console.error(`❌ Error: File not found at ${imagePath}`);
            console.log('\nPlease add the vlcsnap-2025-11-12-02h05m05s496.jpg file to:');
            console.log('projects/photography/images/');
            process.exit(1);
        }

        console.log('📝 Adding EXIF metadata to vlcsnap photo...\n');

        // Write EXIF metadata
        await exiftool.write(imagePath, {
            Make: 'Apple',
            Model: 'iPhone 15',
            Flash: 'Off, Did not fire',
            City: 'Loveland',
            State: 'Colorado',
            Country: 'United States',
            LocationCreatedCity: 'Loveland',
            LocationCreatedProvinceState: 'Colorado',
            LocationCreatedCountryName: 'United States',
            DateTimeOriginal: '2025:09:20 13:31:10',
            CreateDate: '2025:09:20 13:31:10',
            ModifyDate: '2025:09:20 13:31:10'
        });

        console.log('✅ Metadata successfully added!');
        console.log('\nAdded metadata:');
        console.log('  Camera: Apple iPhone 15');
        console.log('  Location: Loveland, Colorado');
        console.log('  Flash: Off, Did not fire');
        console.log('\nYou can now remove the manual metadata from photo-loader.js');

    } catch (error) {
        console.error('❌ Error adding metadata:', error.message);
        process.exit(1);
    } finally {
        // Always close exiftool process
        await exiftool.end();
    }
}

addMetadata();
