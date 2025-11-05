/**
 * Photography Gallery - Auto Photo Loader
 * Add your photos to the images array below with their dates
 */

(function() {
    'use strict';

    // === CONFIGURATION ===
    // Add your photos here! Just add the filename and date.
    // The system will auto-load them and sort by date (oldest first in timeline)
    const photos = [
        { file: '68223264_Unknown.JPG', date: '2017-08-21' },
        { file: 'IMG_0955.jpg', date: '2018-03-14' },
        { file: 'IMG_0966.jpg', date: '2018-03-14' },
        { file: 'ISIMG-1050811.jpg', date: '2018-07-22' },
        { file: 'IMG_1071.jpg', date: '2019-01-05' },
        { file: 'IMG_1072.jpg', date: '2019-01-05' },
        { file: 'IMG_1073.jpg', date: '2019-04-18' },
        { file: 'IMG_1074.jpg', date: '2019-06-29' },
        { file: 'IMG_1075.jpg', date: '2019-09-12' },
        { file: 'IMG_1076.jpg', date: '2019-11-03' },
        { file: 'IMG_1077.jpg', date: '2020-02-14' },
        { file: 'IMG_1078.jpg', date: '2020-02-14' },
        { file: 'IMG_1079.jpg', date: '2020-05-20' },
        { file: 'IMG_1080.jpg', date: '2020-07-04' },
        { file: 'IMG_1081.jpg', date: '2020-07-04' },
        { file: 'IMG_1082.jpg', date: '2020-08-16' },
        { file: 'IMG_1083.jpg', date: '2020-10-31' },
        { file: 'IMG_1084.jpg', date: '2020-12-25' },
        { file: 'IMG_1085.jpg', date: '2021-01-01' },
        { file: 'IMG_1086.jpg', date: '2021-03-17' },
        { file: 'IMG_1087.jpg', date: '2021-03-17' },
        { file: 'IMG_1089.jpg', date: '2021-05-28' },
        { file: 'IMG_1090.jpg', date: '2021-07-09' },
        { file: 'IMG_1091.jpg', date: '2021-08-13' },
        { file: 'IMG_1092.jpg', date: '2021-09-22' },
        { file: 'IMG_1093.jpg', date: '2021-11-11' },
        { file: 'IMG_1094.jpg', date: '2021-11-11' },
        { file: 'IMG_1095.jpg', date: '2022-01-15' },
        { file: 'IMG_1096.jpg', date: '2022-02-28' },
        { file: 'IMG_1099.jpg', date: '2022-04-10' },
        { file: 'IMG_1100.jpg', date: '2022-04-10' },
        { file: 'IMG_1102.jpg', date: '2022-06-21' },
        { file: 'IMG_1103.jpg', date: '2022-08-05' },
        { file: 'IMG_1104.jpg', date: '2022-09-19' },
        { file: 'IMG_1105.jpg', date: '2022-10-12' },
        { file: 'IMG_1106.jpg', date: '2022-11-24' },
        { file: 'IMG_1107.jpg', date: '2022-12-31' },
        { file: 'IMG_1108.jpg', date: '2023-01-20' },
        { file: 'IMG_1109.jpg', date: '2023-01-20' },
        { file: 'IMG_1110.jpg', date: '2023-03-08' },
        { file: 'IMG_1111.jpg', date: '2023-04-25' },
        { file: 'IMG_1915.jpg', date: '2023-06-14' },
        { file: 'IMG_1916.jpg', date: '2023-06-14' },
        { file: 'IMG_1917.jpg', date: '2023-07-30' },
        { file: 'IMG_1918.jpg', date: '2023-09-02' },
        { file: 'IMG_1919.jpg', date: '2023-10-17' },
        { file: 'IMG_1921.jpg', date: '2023-11-05' },
        { file: 'IMG_1922.jpg', date: '2023-12-12' },
        { file: 'IMG_1923.jpg', date: '2024-01-01' },
        { file: 'IMG_1924.jpg', date: '2024-01-01' },
        { file: 'IMG_1925.jpg', date: '2024-02-14' },
        { file: 'IMG_1926.jpg', date: '2024-03-22' },
        { file: 'IMG_1928.jpg', date: '2024-04-08' },
        { file: 'IMG_1929.jpg', date: '2024-05-16' },
        { file: 'IMG_1931.jpg', date: '2024-05-16' },
        { file: 'IMG_1934.jpg', date: '2024-06-29' },
        { file: 'IMG_1936.jpg', date: '2024-07-04' },
        { file: 'IMG_1937.jpg', date: '2024-07-04' },
        { file: 'IMG_1938.jpg', date: '2024-08-11' },
        { file: 'IMG_1939.jpg', date: '2024-09-03' },
        { file: 'IMG_1942.jpg', date: '2024-09-20' },
        { file: 'IMG_1946.jpg', date: '2024-10-15' },
        { file: 'IMG_1947.jpg', date: '2024-10-15' },
        { file: 'IMG_1948.jpg', date: '2024-11-01' },
        { file: 'IMG_1949.jpg', date: '2024-12-08' },
        { file: 'IMG_1951.jpg', date: '2024-12-25' },
        { file: 'IMG_1952.jpg', date: '2024-12-25' },
        { file: 'IMG_1953.jpg', date: '2025-01-15' },
        { file: 'IMG_1959.jpg', date: '2025-03-10' },
    ];

    // === AUTO-LOAD SYSTEM ===
    const imagePath = 'images/';
    let currentIndex = 0;
    let loadedPhotos = [];

    const elements = {
        loading: document.getElementById('loading'),
        noPhotos: document.getElementById('no-photos'),
        galleryLayout: document.getElementById('gallery-layout'),
        photoDate: document.getElementById('photo-date'),
        photoFilename: document.getElementById('photo-filename'),
        photoCount: document.getElementById('photo-count'),
        mainPhoto: document.getElementById('main-photo'),
        timelineTrack: document.getElementById('timeline-track'),
        timelineScroll: document.getElementById('timeline-scroll'),
        photoDimensions: document.getElementById('photo-dimensions'),
        photoAspect: document.getElementById('photo-aspect'),
        photoCamera: document.getElementById('photo-camera'),
        photoLens: document.getElementById('photo-lens'),
        photoSettings: document.getElementById('photo-settings'),
        exifSection: document.getElementById('exif-section')
    };

    // Sort photos by date (oldest first for timeline)
    photos.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Initialize gallery
    function init() {
        if (photos.length === 0) {
            showNoPhotos();
            return;
        }

        loadPhotos();
    }

    // Load all photos
    async function loadPhotos() {
        const totalPhotos = photos.length;
        const loadPromises = [];

        // Update loading message
        elements.loading.textContent = `Loading photos (0/${totalPhotos})...`;

        // Process all photos
        for (let index = 0; index < photos.length; index++) {
            const photo = photos[index];

            const loadPromise = (async () => {
                try {
                    const imageSrc = imagePath + photo.file;

                    // Load the image
                    return new Promise((resolve, reject) => {
                        const img = new Image();

                        img.onload = function() {
                            console.log(`✓ Loaded: ${photo.file} (${img.naturalWidth}x${img.naturalHeight})`);
                            resolve({
                                ...photo,
                                index: index,
                                img: img,
                                src: imageSrc,
                                width: img.naturalWidth,
                                height: img.naturalHeight
                            });
                        };
                        img.onerror = function() {
                            console.error(`✗ Failed to load: ${photo.file}`);
                            reject(new Error(`Failed to load: ${photo.file}`));
                        };
                        img.src = imageSrc;
                    });
                } catch (error) {
                    console.error(`✗ Error processing ${photo.file}:`, error);
                    return null;
                }
            })();

            loadPromises.push(loadPromise);
        }

        // Wait for all photos to load
        const results = await Promise.allSettled(loadPromises);

        // Filter successful loads
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value !== null) {
                loadedPhotos.push(result.value);
            }
        });

        console.log(`Loaded ${loadedPhotos.length} of ${totalPhotos} photos`);

        if (loadedPhotos.length > 0) {
            initGallery();
        } else {
            showNoPhotos();
        }
    }

    // Initialize gallery UI
    function initGallery() {
        elements.loading.style.display = 'none';
        elements.galleryLayout.style.display = 'flex';

        buildTimeline();
        showPhoto(0);
    }

    // Build horizontal timeline with tick marks (iPhone style)
    function buildTimeline() {
        console.log(`Building timeline with ${loadedPhotos.length} photos`);

        // Group photos by date (same day = same tick)
        const groups = [];
        const dateMap = new Map();

        loadedPhotos.forEach((photo, index) => {
            const dateKey = photo.date; // YYYY-MM-DD format
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, []);
            }
            dateMap.get(dateKey).push({ ...photo, globalIndex: index });
        });

        console.log(`Created ${dateMap.size} date groups`);

        // Convert map to array of groups
        dateMap.forEach((photos, date) => {
            groups.push({
                date: date,
                photos: photos
            });
        });

        // Sort groups by date
        groups.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Clear existing timeline
        elements.timelineTrack.innerHTML = '';

        // Build tick marks
        let lastYear = null;

        console.log(`Building ${groups.length} tick marks`);

        groups.forEach((group, groupIndex) => {
            const firstPhoto = group.photos[0];
            const photoDate = new Date(group.date);
            const year = photoDate.getFullYear();
            const month = photoDate.toLocaleDateString('en-US', { month: 'short' });

            // Create tick mark container
            const tickMark = document.createElement('div');
            tickMark.className = 'tick-mark';
            tickMark.dataset.index = firstPhoto.globalIndex; // Use first photo for navigation

            // Mark as major if year changed
            if (year !== lastYear) {
                tickMark.classList.add('major');
                lastYear = year;
            }

            // Create tick line
            const tickLine = document.createElement('div');
            tickLine.className = 'tick-line';
            tickMark.appendChild(tickLine);

            // Create thumbnail
            const thumbnail = document.createElement('div');
            thumbnail.className = 'tick-thumbnail';
            const img = document.createElement('img');
            img.src = firstPhoto.src || (imagePath + firstPhoto.file);
            img.alt = `Photo ${firstPhoto.globalIndex + 1}`;
            thumbnail.appendChild(img);
            tickMark.appendChild(thumbnail);

            // Add stack indicator if multiple photos on same date
            if (group.photos.length > 1) {
                const stackIndicator = document.createElement('div');
                stackIndicator.className = 'stack-indicator';
                stackIndicator.textContent = group.photos.length;
                tickMark.appendChild(stackIndicator);
            }

            // Create date label
            const label = document.createElement('div');
            label.className = 'tick-label';
            label.textContent = tickMark.classList.contains('major') ? year : month;
            tickMark.appendChild(label);

            // Click handler - cycle through photos on this date
            let photoIndexInGroup = 0;
            tickMark.addEventListener('click', () => {
                const photo = group.photos[photoIndexInGroup];
                showPhoto(photo.globalIndex);

                // If multiple photos, cycle through them on repeated clicks
                if (group.photos.length > 1) {
                    photoIndexInGroup = (photoIndexInGroup + 1) % group.photos.length;
                }
            });

            elements.timelineTrack.appendChild(tickMark);
        });

        // Apply initial perspective scaling
        updatePerspective();

        // Update perspective on scroll - use passive for better performance
        elements.timelineScroll.addEventListener('scroll', updatePerspective, { passive: true });
    }

    // Update perspective scaling based on distance from center
    let rafId = null;
    function updatePerspective() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
            const ticks = document.querySelectorAll('.tick-mark');
            const scrollContainer = elements.timelineScroll;
            const centerX = scrollContainer.offsetWidth / 2;

            ticks.forEach(tick => {
                const rect = tick.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();
                const tickCenterX = rect.left + rect.width / 2 - containerRect.left;

                // Calculate distance from center (0 to 1, where 1 is at edge)
                const distance = Math.abs(tickCenterX - centerX) / centerX;

                // Scale based on distance (0.4 to 1.0)
                // Ticks at center are full size, ticks at edges are 40% size
                const scale = Math.max(0.4, 1 - (distance * 0.6));

                // Apply scaling - use transform for better performance
                tick.style.transform = `scaleY(${scale})`;
                tick.style.opacity = Math.max(0.3, scale);
            });

            rafId = null;
        });
    }

    // Calculate days between dates
    function daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.abs((date2 - date1) / oneDay);
    }

    // Show specific photo
    function showPhoto(index) {
        if (index < 0 || index >= loadedPhotos.length) return;

        currentIndex = index;
        const photo = loadedPhotos[index];

        // Fade out
        elements.mainPhoto.classList.remove('visible');

        setTimeout(() => {
            elements.mainPhoto.src = photo.src || (imagePath + photo.file);

            // Update basic info
            const date = new Date(photo.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            elements.photoDate.textContent = formattedDate;
            elements.photoFilename.textContent = photo.file;
            elements.photoCount.textContent = `Photo ${index + 1} of ${loadedPhotos.length}`;

            // Update dimensions
            const aspectRatio = calculateAspectRatio(photo.width, photo.height);
            elements.photoDimensions.textContent = `${photo.width} × ${photo.height}px`;
            elements.photoAspect.textContent = aspectRatio;

            // Fade in
            setTimeout(() => {
                elements.mainPhoto.classList.add('visible');
            }, 50);
        }, 200);

        // Update active tick mark
        const currentPhotoDate = photo.date;
        document.querySelectorAll('.tick-mark').forEach((tick) => {
            const tickPhotos = Array.from(tick.querySelectorAll('img'))
                .map(img => img.alt)
                .join('');

            // Check if this tick contains the current photo
            const tickPhoto = loadedPhotos.find(p => p.globalIndex === parseInt(tick.dataset.index));
            if (tickPhoto && tickPhoto.date === currentPhotoDate) {
                tick.classList.add('active');
            } else {
                tick.classList.remove('active');
            }
        });

        // Scroll to active tick
        scrollToActiveThumb(index);
    }

    // Calculate aspect ratio
    function calculateAspectRatio(width, height) {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(width, height);
        const ratioW = width / divisor;
        const ratioH = height / divisor;

        // Check for common ratios
        const ratio = width / height;
        if (Math.abs(ratio - 16/9) < 0.01) return '16:9';
        if (Math.abs(ratio - 4/3) < 0.01) return '4:3';
        if (Math.abs(ratio - 3/2) < 0.01) return '3:2';
        if (Math.abs(ratio - 1) < 0.01) return '1:1 (Square)';
        if (Math.abs(ratio - 21/9) < 0.01) return '21:9';

        return `${ratioW}:${ratioH}`;
    }

    // Scroll timeline to active tick mark (horizontal)
    function scrollToActiveThumb(index) {
        const photo = loadedPhotos[index];
        if (!photo) return;

        // Find the tick mark that matches this photo's date
        const ticks = document.querySelectorAll('.tick-mark');
        for (let tick of ticks) {
            const tickPhoto = loadedPhotos.find(p => p.globalIndex === parseInt(tick.dataset.index));
            if (tickPhoto && tickPhoto.date === photo.date) {
                const scrollContainer = elements.timelineScroll;
                const tickLeft = tick.offsetLeft;
                const scrollLeft = tickLeft - (scrollContainer.offsetWidth / 2) + (tick.offsetWidth / 2);

                scrollContainer.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });

                // Update perspective after scroll
                setTimeout(() => {
                    updatePerspective();
                }, 300);
                break;
            }
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (loadedPhotos.length === 0) return;

        if (e.key === 'ArrowLeft') {
            const newIndex = currentIndex > 0 ? currentIndex - 1 : loadedPhotos.length - 1;
            showPhoto(newIndex);
        } else if (e.key === 'ArrowRight') {
            const newIndex = currentIndex < loadedPhotos.length - 1 ? currentIndex + 1 : 0;
            showPhoto(newIndex);
        }
    });

    // Show no photos message
    function showNoPhotos() {
        elements.loading.style.display = 'none';
        elements.noPhotos.style.display = 'block';
    }

    // Get oldest photo info (for project card)
    function getOldestPhotoInfo() {
        if (loadedPhotos.length === 0) return null;
        const oldest = loadedPhotos[0];
        const date = new Date(oldest.date);
        return {
            month: date.toLocaleDateString('en-US', { month: 'long' }),
            year: date.getFullYear(),
            image: oldest.src || (imagePath + oldest.file)
        };
    }

    // Export for project card
    window.photographyGallery = {
        getOldestPhotoInfo: getOldestPhotoInfo,
        photoCount: photos.length
    };

    // Update perspective on window resize
    window.addEventListener('resize', () => {
        if (loadedPhotos.length > 0) {
            updatePerspective();
        }
    });

    // Initialize on load
    init();

})();
