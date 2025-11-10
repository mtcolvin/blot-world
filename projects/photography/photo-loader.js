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
                    return new Promise(async (resolve, reject) => {
                        const img = new Image();

                        img.onload = async function() {
                            console.log(`✓ Loaded: ${photo.file} (${img.naturalWidth}x${img.naturalHeight})`);

                            // Extract EXIF data
                            let exifData = null;
                            let exifDate = photo.date; // Use manual date as fallback

                            try {
                                exifData = await exifr.parse(imageSrc, {
                                    tiff: true,
                                    exif: true,
                                    gps: false,
                                    interop: false,
                                    pick: ['Make', 'Model', 'LensModel', 'ISO', 'FNumber', 'ExposureTime',
                                           'DateTimeOriginal', 'FocalLength', 'FocalLengthIn35mmFormat']
                                });

                                // Use EXIF date if available and no manual date provided
                                if (exifData?.DateTimeOriginal && !photo.date) {
                                    exifDate = exifData.DateTimeOriginal.toISOString().split('T')[0];
                                }

                                console.log(`  EXIF: ${exifData?.Make || 'N/A'} ${exifData?.Model || ''}`);
                            } catch (error) {
                                console.warn(`  No EXIF data for ${photo.file}`);
                            }

                            resolve({
                                ...photo,
                                index: index,
                                img: img,
                                src: imageSrc,
                                width: img.naturalWidth,
                                height: img.naturalHeight,
                                date: exifDate,
                                exif: exifData
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

        // Wait for timeline to render before showing most recent photo
        setTimeout(() => {
            isProgrammaticScroll = true;
            showPhoto(loadedPhotos.length - 1); // Start with most recent photo
            setTimeout(() => {
                isProgrammaticScroll = false;
            }, 1000);
        }, 100);

        setupNavigationButtons();
    }

    // Setup navigation button click handlers
    function setupNavigationButtons() {
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigatePhoto('prev'));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => navigatePhoto('next'));
        }

        updateNavigationButtons();
    }

    // Build horizontal timeline with monthly ticks
    function buildTimeline() {
        console.log(`Building timeline with ${loadedPhotos.length} photos`);

        // Group photos by month (YYYY-MM format)
        const photosByMonth = new Map();

        loadedPhotos.forEach((photo, index) => {
            const photoDate = new Date(photo.date);
            const monthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;

            if (!photosByMonth.has(monthKey)) {
                photosByMonth.set(monthKey, []);
            }
            photosByMonth.get(monthKey).push({ ...photo, globalIndex: index });
        });

        // Find date range - from first photo to present day
        const firstPhotoDate = new Date(loadedPhotos[0].date);
        const today = new Date();

        // Generate all months from first photo to present
        const allMonths = [];
        let currentDate = new Date(firstPhotoDate.getFullYear(), firstPhotoDate.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth(), 1);

        while (currentDate <= endDate) {
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            allMonths.push({
                key: monthKey,
                year: currentDate.getFullYear(),
                month: currentDate.getMonth(),
                photos: photosByMonth.get(monthKey) || []
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        console.log(`Generated ${allMonths.length} monthly ticks`);

        // Clear existing timeline
        elements.timelineTrack.innerHTML = '';

        // Build tick marks for each month
        let lastYear = null;

        allMonths.forEach((monthData) => {
            const { year, month, photos } = monthData;
            const isNewYear = year !== lastYear;

            // Create tick mark container
            const tickMark = document.createElement('div');
            tickMark.className = 'tick-mark';

            if (isNewYear) {
                tickMark.classList.add('year');
                lastYear = year;
            }

            if (photos.length > 0) {
                tickMark.classList.add('has-photos');
                tickMark.dataset.monthKey = monthData.key;

                // Create stacked squares container
                const previewsContainer = document.createElement('div');
                previewsContainer.className = 'tick-previews';

                // Add square for each photo (up to 3)
                photos.slice(0, 3).forEach((photo, index) => {
                    const square = document.createElement('div');
                    square.className = 'tick-thumbnail';
                    square.textContent = index + 1; // Number 1, 2, 3
                    square.dataset.photoIndex = photo.globalIndex; // Store global photo index
                    previewsContainer.appendChild(square);
                });

                tickMark.appendChild(previewsContainer);

                // Click handler - cycle through photos in this month
                let photoIndexInMonth = 0;
                tickMark.addEventListener('click', () => {
                    const photo = photos[photoIndexInMonth];
                    showPhoto(photo.globalIndex);

                    // Cycle to next photo in month on repeated clicks
                    if (photos.length > 1) {
                        photoIndexInMonth = (photoIndexInMonth + 1) % photos.length;
                    }
                });
            } else {
                tickMark.classList.add('empty');
            }

            // Create tick line
            const tickLine = document.createElement('div');
            tickLine.className = 'tick-line';
            tickMark.appendChild(tickLine);

            // Create date label
            const label = document.createElement('div');
            label.className = 'tick-label';

            if (isNewYear) {
                label.textContent = year;
            } else {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                label.textContent = monthNames[month];
            }

            tickMark.appendChild(label);

            elements.timelineTrack.appendChild(tickMark);
        });

        console.log(`Built ${allMonths.length} tick marks`);
    }

    // Show specific photo
    function showPhoto(index, skipScroll = false) {
        if (index < 0 || index >= loadedPhotos.length) return;

        currentIndex = index;
        const photo = loadedPhotos[index];

        // Fade out
        elements.mainPhoto.classList.remove('visible');

        setTimeout(() => {
            elements.mainPhoto.src = photo.src || (imagePath + photo.file);

            // Detect orientation and set data attribute
            const orientation = photo.width > photo.height ? 'landscape' : 'portrait';
            elements.mainPhoto.setAttribute('data-orientation', orientation);

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

            // Update EXIF camera settings if available
            if (photo.exif && (photo.exif.Make || photo.exif.Model || photo.exif.LensModel ||
                photo.exif.ISO || photo.exif.FNumber || photo.exif.ExposureTime)) {
                elements.exifSection.style.display = 'block';

                // Camera
                const camera = [photo.exif.Make, photo.exif.Model].filter(Boolean).join(' ');
                elements.photoCamera.textContent = camera || '—';

                // Lens
                elements.photoLens.textContent = photo.exif.LensModel || '—';

                // Settings (ISO, Aperture, Shutter Speed, Focal Length)
                const settings = [];
                if (photo.exif.ISO) settings.push(`ISO ${photo.exif.ISO}`);
                if (photo.exif.FNumber) settings.push(`f/${photo.exif.FNumber}`);
                if (photo.exif.ExposureTime) {
                    const shutterSpeed = photo.exif.ExposureTime < 1
                        ? `1/${Math.round(1 / photo.exif.ExposureTime)}s`
                        : `${photo.exif.ExposureTime}s`;
                    settings.push(shutterSpeed);
                }
                if (photo.exif.FocalLength) {
                    settings.push(`${photo.exif.FocalLength}mm`);
                }
                elements.photoSettings.textContent = settings.length > 0 ? settings.join(' · ') : '—';
            } else {
                elements.exifSection.style.display = 'none';
            }

            // Fade in
            setTimeout(() => {
                elements.mainPhoto.classList.add('visible');
            }, 50);
        }, 200);

        // Update active square based on current photo
        document.querySelectorAll('.tick-thumbnail').forEach((square) => {
            if (square.dataset.photoIndex === String(index)) {
                square.classList.add('active');
            } else {
                square.classList.remove('active');
            }
        });

        // Update active tick mark label based on photo's month
        const photoDate = new Date(photo.date);
        const photoMonthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;

        document.querySelectorAll('.tick-mark').forEach((tick) => {
            if (tick.dataset.monthKey === photoMonthKey) {
                tick.classList.add('active');
            } else {
                tick.classList.remove('active');
            }
        });

        // Scroll to active tick (unless we're scrolling manually)
        if (!skipScroll) {
            scrollToActiveThumb(index);
        }

        // Update navigation button states
        updateNavigationButtons();
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

        // Find the tick mark that matches this photo's month
        const photoDate = new Date(photo.date);
        const photoMonthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;

        const ticks = document.querySelectorAll('.tick-mark');
        for (let tick of ticks) {
            if (tick.dataset.monthKey === photoMonthKey) {
                const scrollContainer = elements.timelineScroll;

                // Get the tick's position relative to the timeline track
                const tickRect = tick.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();

                // Calculate how much to scroll to center the tick
                const tickCenter = tick.offsetLeft + (tick.offsetWidth / 2);
                const containerCenter = scrollContainer.offsetWidth / 2;
                const scrollLeft = scrollContainer.scrollLeft + (tickRect.left - containerRect.left) - containerCenter + (tickRect.width / 2);

                scrollContainer.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
                break;
            }
        }
    }

    // Timeline scroll handler - update photo based on centered tick
    let scrollTimeout;
    let isProgrammaticScroll = false;

    elements.timelineScroll.addEventListener('scroll', () => {
        // Skip if we're programmatically scrolling from navigation
        if (isProgrammaticScroll) return;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollContainer = elements.timelineScroll;
            const containerRect = scrollContainer.getBoundingClientRect();
            const containerCenterX = containerRect.left + (containerRect.width / 2);

            // Find the tick closest to center using getBoundingClientRect
            const ticks = document.querySelectorAll('.tick-mark.has-photos');
            let closestTick = null;
            let closestDistance = Infinity;

            ticks.forEach(tick => {
                const tickRect = tick.getBoundingClientRect();
                const tickCenterX = tickRect.left + (tickRect.width / 2);
                const distance = Math.abs(tickCenterX - containerCenterX);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestTick = tick;
                }
            });

            // Find the first photo in that month and show it
            if (closestTick && closestTick.dataset.monthKey) {
                const monthKey = closestTick.dataset.monthKey;
                const photoIndex = loadedPhotos.findIndex(photo => {
                    const photoDate = new Date(photo.date);
                    const photoMonthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;
                    return photoMonthKey === monthKey;
                });

                if (photoIndex !== -1) {
                    // Update photo if it's different
                    if (photoIndex !== currentIndex) {
                        showPhoto(photoIndex, true); // Skip scroll to avoid loop
                    }

                    // Snap to center the tick mark after scrolling stops
                    const tickRect = closestTick.getBoundingClientRect();
                    const tickCenterX = tickRect.left + (tickRect.width / 2);
                    const scrollLeft = scrollContainer.scrollLeft + (tickCenterX - containerCenterX);

                    scrollContainer.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth'
                    });
                }
            }
        }, 150); // Debounce scroll events
    });

    // Navigation function with button state updates
    function navigatePhoto(direction) {
        if (loadedPhotos.length === 0) return;

        let newIndex;
        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        } else {
            newIndex = currentIndex < loadedPhotos.length - 1 ? currentIndex + 1 : currentIndex;
        }

        if (newIndex !== currentIndex) {
            isProgrammaticScroll = true;
            showPhoto(newIndex);
            setTimeout(() => {
                isProgrammaticScroll = false;
            }, 600); // Wait for scroll animation to complete
        }
    }

    // Update navigation button states
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn && nextBtn) {
            // Dim previous button if at start
            if (currentIndex === 0) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }

            // Dim next button if at end
            if (currentIndex === loadedPhotos.length - 1) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (loadedPhotos.length === 0) return;

        if (e.key === 'ArrowLeft') {
            navigatePhoto('prev');
        } else if (e.key === 'ArrowRight') {
            navigatePhoto('next');
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

    // Check if timeline needs updating (new month started)
    let lastCheckedMonth = new Date().getMonth();
    setInterval(() => {
        const currentMonth = new Date().getMonth();
        if (currentMonth !== lastCheckedMonth) {
            console.log('New month detected, rebuilding timeline...');
            lastCheckedMonth = currentMonth;
            if (loadedPhotos.length > 0) {
                buildTimeline();
            }
        }
    }, 60000); // Check every minute

    // Initialize on load
    init();

})();
