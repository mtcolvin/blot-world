#!/usr/bin/env python3
"""
Generate metadata JSON file with correct EXIF dates from photos
"""
import os
import json
import subprocess
import re

def get_exif_date_with_magick(filepath):
    """Extract DateTimeOriginal from image using ImageMagick"""
    try:
        result = subprocess.run(
            ['magick', 'identify', '-verbose', filepath],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            output = result.stdout

            # Try DateTimeOriginal first
            match = re.search(r'exif:DateTimeOriginal:\s*(\d{4}):(\d{2}):(\d{2})', output)
            if match:
                return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"

            # Try DateTimeDigitized
            match = re.search(r'exif:DateTimeDigitized:\s*(\d{4}):(\d{2}):(\d{2})', output)
            if match:
                return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"

            # Fall back to DateTime
            match = re.search(r'exif:DateTime:\s*(\d{4}):(\d{2}):(\d{2})', output)
            if match:
                return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

    return None

def main():
    metadata = {}
    images_dir = 'images'

    print(f"Scanning {images_dir} for photos...\n")

    if os.path.exists(images_dir):
        photo_files = [f for f in os.listdir(images_dir)
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.heic'))]

        print(f"Found {len(photo_files)} photos to process\n")

        for i, filename in enumerate(sorted(photo_files), 1):
            filepath = os.path.join(images_dir, filename)
            print(f"[{i}/{len(photo_files)}] Processing {filename}...")
            date = get_exif_date_with_magick(filepath)

            if date:
                metadata[filename] = date
                print(f"  OK Date: {date}")
            else:
                print(f"  WARN No EXIF date found")

    # Write metadata to JSON file
    with open('photo_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\nMetadata written to photo_metadata.json")
    print(f"Total photos processed: {len(metadata)}")

if __name__ == '__main__':
    main()
