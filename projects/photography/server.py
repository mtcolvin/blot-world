#!/usr/bin/env python3
"""
Simple HTTP server for photography gallery that auto-detects photos
"""
import os
import json
import subprocess
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime
import mimetypes

# Global variable for photo metadata
PHOTO_METADATA = {}

def get_exif_date_with_magick(filepath):
    """Extract DateTimeOriginal from image using ImageMagick"""
    try:
        result = subprocess.run(
            ['magick', 'identify', '-verbose', filepath],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            output = result.stdout
            # Try DateTimeOriginal first
            match = re.search(r'exif:DateTimeOriginal:\s*(\d{4}):(\d{2}):(\d{2})', output)
            if match:
                return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"

            # Fallback to DateTime
            match = re.search(r'exif:DateTime:\s*(\d{4}):(\d{2}):(\d{2})', output)
            if match:
                return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
    except Exception as e:
        print(f"Error extracting EXIF from {filepath}: {e}")

    return None

def load_metadata():
    """Load photo metadata from JSON file"""
    global PHOTO_METADATA
    try:
        metadata_path = 'projects/photography/photo_metadata.json'
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                PHOTO_METADATA = json.load(f)
                print(f"Loaded metadata for {len(PHOTO_METADATA)} photos")
        else:
            print(f"Metadata file not found at {metadata_path}")
    except Exception as e:
        print(f"Could not load photo metadata: {e}")

class GalleryHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # API endpoint to list photos
        if self.path == '/api/photos':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            photos = []
            images_dir = 'projects/photography/images'

            if os.path.exists(images_dir):
                for filename in sorted(os.listdir(images_dir)):
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.heic')):
                        filepath = os.path.join(images_dir, filename)

                        # Get date from metadata JSON cache
                        date = PHOTO_METADATA.get(filename)

                        # Fallback to file modification time if not in cache
                        if not date:
                            print(f"Warning: {filename} not in metadata cache, using file date")
                            mtime = os.path.getmtime(filepath)
                            date = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')

                        photos.append({
                            'file': filename,
                            'date': date
                        })

            # Sort by date
            photos.sort(key=lambda x: x['date'])

            self.wfile.write(json.dumps(photos).encode())
        else:
            # Serve static files normally
            super().do_GET()

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, GalleryHandler)
    print(f'Starting photography gallery server on port {port}...')
    print(f'Visit: http://localhost:{port}/projects/photography/photography.html')
    print(f'API endpoint: http://localhost:{port}/api/photos')
    httpd.serve_forever()

if __name__ == '__main__':
    # Change to project root directory
    os.chdir('../..')
    load_metadata()
    run()
