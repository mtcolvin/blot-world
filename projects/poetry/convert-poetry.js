#!/usr/bin/env node

/**
 * Poetry Converter Script
 * Converts .txt files from a poetry folder into a poems.json file
 * 
 * Usage: node convert-poetry.js <poetry-folder-path>
 * Example: node convert-poetry.js ./poetry
 */

const fs = require('fs');
const path = require('path');

// Get folder path from command line argument
const folderPath = process.argv[2] || './poetry';

// Check if folder exists
if (!fs.existsSync(folderPath)) {
    console.error(`Error: Folder "${folderPath}" does not exist.`);
    console.log('Usage: node convert-poetry.js <poetry-folder-path>');
    process.exit(1);
}

// Read all .txt files from the folder
const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.txt'))
    .sort(); // Sort alphabetically

if (files.length === 0) {
    console.error(`Error: No .txt files found in "${folderPath}"`);
    process.exit(1);
}

console.log(`Found ${files.length} poetry file(s):\n`);

// Convert each file to poem object
const poems = files.map((file, index) => {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract title from filename (remove .txt and replace - or _ with spaces)
    const titleFromFilename = path.basename(file, '.txt')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize each word
    
    // Try to extract metadata from the first few lines
    const lines = content.split('\n');
    let title = titleFromFilename;
    let date = '';
    let poemContent = content;
    
    // Check if first line is a title (usually short and ends with newline)
    if (lines[0] && lines[0].trim().length > 0 && lines[0].trim().length < 100) {
        title = lines[0].trim();
        
        // Check if second line is a date
        if (lines[1] && lines[1].trim().match(/\d{4}|\w+\s+\d{4}/)) {
            date = lines[1].trim();
            // Content starts from line 3 (skip title and date)
            poemContent = lines.slice(2).join('\n').trim();
        } else {
            // Content starts from line 2 (skip just title)
            poemContent = lines.slice(1).join('\n').trim();
        }
    }
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Title: ${title}`);
    if (date) console.log(`   Date: ${date}`);
    console.log('');
    
    return {
        id: path.basename(file, '.txt').toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: title,
        date: date || 'Undated',
        content: poemContent,
        filename: file
    };
});

// Write to poems.json
const outputPath = path.join(path.dirname(folderPath), 'poems.json');
fs.writeFileSync(outputPath, JSON.stringify(poems, null, 2), 'utf-8');

console.log(`✓ Successfully created poems.json with ${poems.length} poem(s)`);
console.log(`  Output: ${outputPath}`);
console.log('\nNext step: Place poems.json in the same directory as your poetry-showcase.html file');
