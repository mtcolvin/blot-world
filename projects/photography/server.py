#!/usr/bin/env python3
"""
Simple HTTP server for photography gallery that auto-detects photos
"""
import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS
import mimetypes

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

                        # Try to get EXIF date
                        date = None
                        try:
                            with Image.open(filepath) as img:
                                exif = img._getexif()
                                if exif:
                                    for tag_id, value in exif.items():
                                        tag = TAGS.get(tag_id, tag_id)
                                        if tag == 'DateTimeOriginal' or tag == 'DateTime':
                                            # Convert EXIF date format (2025:11:02 12:12:14) to ISO format
                                            date = value.split()[0].replace(':', '-')
                                            break
                        except Exception as e:
                            print(f"Could not read EXIF from {filename}: {e}")

                        # Fallback to file modification time if no EXIF date
                        if not date:
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
    run()
