/**
 * Photography Gallery - Auto Photo Loader
 * Add your photos to the images array below with their dates
 */

(function() {
    'use strict';

    // === CONFIGURATION ===
    // Photos will be auto-loaded from the API
    // Add your photos here! Just add the filename and date.
    // The system will auto-load them and sort by date (oldest first in timeline)
    const photos = [
        { file: '68223264_Unknown.JPG', date: '2017-08-21' },
        { file: 'IMG_1325_result.jpg', date: '2024-06-22' },
        { file: 'IMG_1352_result.jpg', date: '2024-06-25' },
        { file: 'IMG_1395_result.jpg', date: '2024-06-28' },
        { file: 'IMG_1992_result_1.jpg', date: '2024-08-12' },
        { file: 'IMG_2010_result_1.jpg', date: '2024-08-13' },
        { file: 'image0.jpeg', date: '2024-12-10' },
        { file: 'IMG_4037_result_1.jpg', date: '2025-01-14' },
        { file: 'IMG_5567_result.jpg', date: '2025-03-10' },
        { file: 'IMG_6346_result_1.jpg', date: '2025-04-04' },
        { file: 'IMG_6582_result.jpg', date: '2025-04-09' },
        { file: 'IMG_7624_result_1.jpg', date: '2025-05-29' },
        { file: 'IMG_8446_result.jpg', date: '2025-06-17' },
        { file: 'IMG_8419_result.jpg', date: '2025-06-17' },
        { file: 'IMG_8332_result.jpg', date: '2025-06-17' },
        { file: 'IMG_8612_result.jpg', date: '2025-06-18' },
        { file: 'IMG_8606_result.jpg', date: '2025-06-18' },
        { file: 'IMG_8513_result.jpg', date: '2025-06-18' },
        { file: 'IMG_8493_result.jpg', date: '2025-06-18' },
        { file: 'IMG_8464_result.jpg', date: '2025-06-18' },
        { file: 'IMG_8818_result.jpg', date: '2025-06-19' },
        { file: 'IMG_8739_result.jpg', date: '2025-06-19' },
        { file: 'IMG_8727_result.jpg', date: '2025-06-19' },
        { file: 'IMG_9017_result.jpg', date: '2025-06-20' },
        { file: 'IMG_9007_result.jpg', date: '2025-06-20' },
        { file: 'IMG_9810_result_1.jpg', date: '2025-08-03' },
        { file: 'IMG_0236_result.jpg', date: '2025-09-08' },
        { file: 'vlcsnap-2025-11-12-02h05m05s496.jpg', date: '2025-09-20' },
        { file: 'IMG_0772_result.jpg', date: '2025-10-21' },
        { file: 'IMG_0969_result.jpg', date: '2025-11-02' },
        { file: 'IMG_0966_result.jpg', date: '2025-11-02' },
        { file: 'IMG_0955_result.jpg', date: '2025-11-02' },
        { file: 'IMG_1264_result.jpg', date: '2025-11-09' },
        { file: 'IMG_1238_result.jpg', date: '2025-11-09' },
        { file: 'IMG_1443_result_1.jpg', date: '2025-11-13' },
        { file: 'IMG_1463_result.jpg', date: '2025-11-16' },
        { file: 'IMG_1507_result.jpg', date: '2025-11-24' },
        { file: 'IMG_1574_result.jpg', date: '2025-11-27' },
        { file: 'IMG_1659_result.jpg', date: '2025-11-28' },
        { file: 'IMG_1649_result.jpg', date: '2025-11-28' },
        { file: 'IMG_1648_result.jpg', date: '2025-11-28' }
    ];

    // === AUTO-LOAD SYSTEM ===
    const imagePath = 'images/';
    let currentIndex = 0;
    let loadedPhotos = [];

    // Mobile detection
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let mobileViewMode = 'grid'; // 'grid' or 'photo'

    // Helper function to parse date strings as local dates (not UTC)
    function parseLocalDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    const elements = {
        loading: document.getElementById('loading'),
        noPhotos: document.getElementById('no-photos'),
        galleryLayout: document.getElementById('gallery-layout'),
        photoDate: document.getElementById('photo-date'),
        photoLocation: document.getElementById('photo-location'),
        locationItem: document.getElementById('location-item'),
        photoFilename: document.getElementById('photo-filename'),
        photoCount: document.getElementById('photo-count'),
        mainPhoto: document.getElementById('main-photo'),
        timelineTrack: document.getElementById('timeline-track'),
        timelineScroll: document.getElementById('timeline-scroll'),
        photoDimensions: document.getElementById('photo-dimensions'),
        photoAspect: document.getElementById('photo-aspect'),
        photoCamera: document.getElementById('photo-camera'),
        photoSettings: document.getElementById('photo-settings'),
        photoFlash: document.getElementById('photo-flash'),
        photoColorSpace: document.getElementById('photo-color-space'),
        photoSoftware: document.getElementById('photo-software'),
        flashItem: document.getElementById('flash-item'),
        colorSpaceItem: document.getElementById('color-space-item'),
        softwareItem: document.getElementById('software-item'),
        exifSection: document.getElementById('exif-section'),
        hoverInfo: document.getElementById('hover-info'),
        zoomOverlay: document.getElementById('zoom-overlay'),
        zoomIn: document.getElementById('zoom-in'),
        zoomOut: document.getElementById('zoom-out'),
        zoomReset: document.getElementById('zoom-reset'),
        zoomLevel: document.getElementById('zoom-level'),
        // Mobile elements
        mobileGridView: document.getElementById('mobile-grid-view'),
        mobileGrid: document.getElementById('mobile-grid'),
        mobileInfoBtn: document.getElementById('mobile-info-btn'),
        mobileCloseBtn: document.getElementById('mobile-close-btn')
    };

    // Initialize gallery
    async function init() {

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
                    // Add cache-busting timestamp to force fresh image load
                    const cacheBuster = Date.now();
                    const imageSrc = `${imagePath}${photo.file}?v=${cacheBuster}`;

                    // Load the image
                    return new Promise(async (resolve, reject) => {
                        const img = new Image();

                        img.onload = async function() {
                            console.log(`✓ Loaded: ${photo.file} (${img.naturalWidth}x${img.naturalHeight})`);

                            // Extract EXIF data
                            let exifData = null;
                            let exifDate = photo.date; // Use manual date as fallback

                            try {
                                if (typeof exifr === 'undefined') {
                                    console.warn('  exifr library not loaded');
                                } else {
                                    exifData = await exifr.parse(imageSrc, {
                                        tiff: true,
                                        exif: true,
                                        gps: true,
                                        interop: false
                                    });

                                    // Use EXIF date if available and no manual date provided
                                    if (exifData?.DateTimeOriginal && !photo.date) {
                                        exifDate = exifData.DateTimeOriginal.toISOString().split('T')[0];
                                    }

                                    if (exifData) {
                                        console.log(`  EXIF: ${exifData?.Make || 'N/A'} ${exifData?.Model || ''} | GPS: ${exifData?.latitude ? 'Yes' : 'No'}`);
                                        console.log(`  GPS Debug - lat: ${exifData?.latitude}, lng: ${exifData?.longitude}, GPSLatitude: ${exifData?.GPSLatitude}`);
                                    } else {
                                        console.warn(`  No EXIF data found in ${photo.file}`);
                                    }
                                }
                            } catch (error) {
                                console.warn(`  EXIF parse error for ${photo.file}:`, error.message);
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

        // Build timeline for both mobile and desktop
        buildTimeline();

        // Check URL for photo parameter
        const urlParams = new URLSearchParams(window.location.search);
        const photoParam = urlParams.get('photo');
        let initialIndex = loadedPhotos.length - 1; // Default to most recent

        if (photoParam) {
            const paramIndex = parseInt(photoParam, 10) - 1; // Convert from 1-indexed to 0-indexed
            if (paramIndex >= 0 && paramIndex < loadedPhotos.length) {
                initialIndex = paramIndex;
            }
        }

        if (isMobile) {
            // Mobile: Build grid and timeline, show grid view
            buildMobileGrid();
            buildMobileTimeline();
            setupMobileHandlers();

            // If URL has photo param, go directly to photo mode
            if (photoParam) {
                switchToPhotoMode(initialIndex);
            } else {
                // Default to grid view (CSS controls visibility via classes)
                if (elements.mobileGridView) {
                    elements.mobileGridView.classList.add('active');
                }
            }
        } else {
            // Desktop: Show gallery layout as before
            elements.galleryLayout.style.display = 'flex';

            // Wait for timeline to render before showing photo
            setTimeout(() => {
                isProgrammaticScroll = true;
                lastProgrammaticScrollTime = Date.now();

                showPhoto(initialIndex);
                setTimeout(() => {
                    isProgrammaticScroll = false;
                }, 1000);
            }, 100);
        }

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
            const photoDate = parseLocalDate(photo.date);
            const monthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;

            if (!photosByMonth.has(monthKey)) {
                photosByMonth.set(monthKey, []);
            }
            photosByMonth.get(monthKey).push({ ...photo, globalIndex: index });
        });

        // Find date range - from first photo to last photo
        const firstPhotoDate = parseLocalDate(loadedPhotos[0].date);
        const lastPhotoDate = parseLocalDate(loadedPhotos[loadedPhotos.length - 1].date);

        // Generate all months from first photo to last photo
        const allMonths = [];
        let currentDate = new Date(firstPhotoDate.getFullYear(), firstPhotoDate.getMonth(), 1);
        const endDate = new Date(lastPhotoDate.getFullYear(), lastPhotoDate.getMonth(), 1);

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

        // Find the maximum number of photos in any month for height calculation
        const maxPhotosPerMonth = Math.max(...allMonths.map(m => m.photos.length), 0);
        console.log(`Max photos in a single month: ${maxPhotosPerMonth}`);

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
            tickMark.dataset.monthKey = monthData.key; // Set monthKey on ALL ticks

            if (isNewYear) {
                tickMark.classList.add('year');
                lastYear = year;
            }

            if (photos.length > 0) {
                tickMark.classList.add('has-photos');

                // Create stacked squares container
                const previewsContainer = document.createElement('div');
                previewsContainer.className = 'tick-previews';

                // Add square for each photo (no limit)
                photos.forEach((photo, index) => {
                    const square = document.createElement('div');
                    square.className = 'tick-thumbnail';
                    square.dataset.photoIndex = photo.globalIndex; // Store global photo index
                    square.dataset.photoNumber = photo.globalIndex + 1; // 1-indexed number

                    // Add hover event listeners
                    square.addEventListener('mouseenter', () => {
                        if (elements.hoverInfo) {
                            elements.hoverInfo.textContent = `Photo ${square.dataset.photoNumber} of ${loadedPhotos.length}`;
                            elements.hoverInfo.classList.add('visible');
                        }
                    });

                    square.addEventListener('mouseleave', () => {
                        if (elements.hoverInfo) {
                            elements.hoverInfo.classList.remove('visible');
                        }
                    });

                    // Click handler - navigate to specific photo
                    square.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent tick mark click
                        clearTimeout(isProgrammaticScrollTimeout);
                        isProgrammaticScroll = true;
                        lastProgrammaticScrollTime = Date.now();
                        // Use instant scroll to avoid timing issues with smooth scroll
                        showPhoto(photo.globalIndex, false, false);
                        isProgrammaticScrollTimeout = setTimeout(() => {
                            isProgrammaticScroll = false;
                        }, 500); // Shorter timeout since we're using instant scroll
                    });

                    previewsContainer.appendChild(square);
                });

                tickMark.appendChild(previewsContainer);
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

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            if (isNewYear) {
                label.textContent = year;
                label.dataset.year = year;
                label.dataset.month = monthNames[month];
            } else {
                label.textContent = monthNames[month];
            }

            tickMark.appendChild(label);

            elements.timelineTrack.appendChild(tickMark);
        });

        console.log(`Built ${allMonths.length} tick marks`);

        // Dynamically adjust timeline height based on max stacked boxes
        adjustTimelineHeight(maxPhotosPerMonth);
    }

    // Adjust timeline height to accommodate stacked preview boxes
    function adjustTimelineHeight(maxPhotosPerMonth) {
        const timelineContainer = document.querySelector('.timeline-container');
        const timelineScroll = document.querySelector('.timeline-scroll');
        const timelineTrack = document.querySelector('.timeline-track');

        if (!timelineContainer) return;

        // Calculate needed height:
        // - Base height for labels and ticks: 12px
        // - Preview boxes start at bottom: 38px from tick
        // - Each preview box: 6px height
        // - Top padding: 0px
        // - Bottom padding: 8px
        const baseHeight = 12;
        const bottomOffset = 38;
        const boxHeight = 6;
        const topPadding = 0;
        const bottomPadding = 8;

        const previewStackHeight = maxPhotosPerMonth * boxHeight;
        const totalHeight = baseHeight + bottomOffset + previewStackHeight + topPadding + bottomPadding;

        // Set minimum height of 70px, maximum of 300px
        const finalHeight = Math.max(70, Math.min(300, totalHeight));

        timelineContainer.style.height = `${finalHeight}px`;
        timelineContainer.style.minHeight = `${finalHeight}px`;

        if (timelineScroll) {
            timelineScroll.style.minHeight = `${finalHeight}px`;
        }

        if (timelineTrack) {
            timelineTrack.style.minHeight = `${finalHeight}px`;
        }

        // Update CSS variable for main content padding
        document.documentElement.style.setProperty('--timeline-height', `${finalHeight}px`);

        console.log(`Timeline height adjusted to ${finalHeight}px for ${maxPhotosPerMonth} max stacked boxes`);
    }

    // === MOBILE GRID FUNCTIONS ===

    // Build mobile grid view
    function buildMobileGrid() {
        if (!elements.mobileGrid) return;

        elements.mobileGrid.innerHTML = '';

        // Sort photos by date (newest first for grid view)
        const sortedPhotos = [...loadedPhotos].reverse();

        // Group photos by year
        const photosByYear = new Map();
        sortedPhotos.forEach((photo, sortedIndex) => {
            const photoDate = parseLocalDate(photo.date);
            const year = photoDate.getFullYear();
            if (!photosByYear.has(year)) {
                photosByYear.set(year, []);
            }
            // Store both the photo and its original index
            const originalIndex = loadedPhotos.length - 1 - sortedIndex;
            photosByYear.get(year).push({ photo, originalIndex });
        });

        // Process each year group
        photosByYear.forEach((yearPhotos, year) => {
            // Create year header wrapper for centering
            const yearWrapper = document.createElement('div');
            yearWrapper.className = 'mobile-grid-year-wrapper';

            // Create year header bubble
            const yearHeader = document.createElement('div');
            yearHeader.className = 'mobile-grid-year';
            yearHeader.textContent = year;

            yearWrapper.appendChild(yearHeader);
            elements.mobileGrid.appendChild(yearWrapper);

            // Create container for this year's photos
            const yearGrid = document.createElement('div');
            yearGrid.className = 'mobile-grid-section';

            // Process photos in pairs to calculate proportional widths
            for (let i = 0; i < yearPhotos.length; i += 2) {
                const { photo: photo1, originalIndex: originalIndex1 } = yearPhotos[i];
                const item2 = yearPhotos[i + 1];
                const photo2 = item2 ? item2.photo : null;
                const originalIndex2 = item2 ? item2.originalIndex : null;

                // Calculate aspect ratios (width / height)
                const ratio1 = photo1.width / photo1.height;
                const ratio2 = photo2 ? photo2.width / photo2.height : ratio1;

                // Calculate proportional widths (accounting for 2px gap)
                const totalRatio = ratio1 + ratio2;
                const width1 = photo2 ? (ratio1 / totalRatio) * 100 : 100;
                const width2 = photo2 ? (ratio2 / totalRatio) * 100 : 0;

                // Create first grid item
                const gridItem1 = document.createElement('div');
                gridItem1.className = 'mobile-grid-item';
                gridItem1.dataset.photoIndex = originalIndex1;
                gridItem1.style.width = `calc(${width1}% - 1px)`;

                const img1 = document.createElement('img');
                img1.src = photo1.src || (imagePath + photo1.file);
                img1.alt = photo1.file;
                img1.loading = 'lazy';

                gridItem1.appendChild(img1);
                gridItem1.addEventListener('click', () => {
                    switchToPhotoMode(originalIndex1);
                });
                yearGrid.appendChild(gridItem1);

                // Create second grid item if exists
                if (photo2) {
                    const gridItem2 = document.createElement('div');
                    gridItem2.className = 'mobile-grid-item';
                    gridItem2.dataset.photoIndex = originalIndex2;
                    gridItem2.style.width = `calc(${width2}% - 1px)`;

                    const img2 = document.createElement('img');
                    img2.src = photo2.src || (imagePath + photo2.file);
                    img2.alt = photo2.file;
                    img2.loading = 'lazy';

                    gridItem2.appendChild(img2);
                    gridItem2.addEventListener('click', () => {
                        switchToPhotoMode(originalIndex2);
                    });
                    yearGrid.appendChild(gridItem2);
                }
            }

            elements.mobileGrid.appendChild(yearGrid);
        });

        console.log(`Built mobile grid with ${loadedPhotos.length} photos across ${photosByYear.size} years`);
    }

    // Store timeline data for reuse
    let timelineData = null;

    // Build mobile activity timeline
    function buildMobileTimeline() {
        const mobileTimeline = document.querySelector('.mobile-timeline');
        if (!mobileTimeline) return;

        // Group photos by month
        const photosByMonth = new Map();
        loadedPhotos.forEach((photo, index) => {
            const photoDate = parseLocalDate(photo.date);
            const monthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;
            if (!photosByMonth.has(monthKey)) {
                photosByMonth.set(monthKey, []);
            }
            photosByMonth.get(monthKey).push({ ...photo, globalIndex: index });
        });

        // Get date range
        const firstDate = parseLocalDate(loadedPhotos[0].date);
        const lastDate = parseLocalDate(loadedPhotos[loadedPhotos.length - 1].date);

        // Generate all months
        const allMonths = [];
        let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
        const endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

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

        // Store for later use
        timelineData = { allMonths, firstDate, lastDate };

        // Find max photos in any month
        const maxPhotos = Math.max(...allMonths.map(m => m.photos.length), 1);

        // Build SVG line graph
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const graphHeight = 30;
        const minY = 4;        // Top padding (max photos)
        const maxY = 22;       // Bottom position for zero photos (leaves 8px gap above x-axis)

        // Generate path points for the line
        const points = allMonths.map((month, idx) => {
            const x = (idx / (allMonths.length - 1 || 1)) * 100;
            // Scale from minY (max photos) to maxY (zero photos)
            const y = maxY - (month.photos.length / maxPhotos) * (maxY - minY);
            return { x, y, month };
        });

        // Create smooth curved line path using cubic bezier
        function createSmoothPath(pts) {
            if (pts.length < 2) return '';

            let path = `M ${pts[0].x} ${pts[0].y}`;

            for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[i === 0 ? i : i - 1];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

                // Control point tension (0.5 = more rounded curves)
                const tension = 0.5;

                const cp1x = p1.x + (p2.x - p0.x) * tension;
                const cp1y = p1.y + (p2.y - p0.y) * tension;
                const cp2x = p2.x - (p3.x - p1.x) * tension;
                const cp2y = p2.y - (p3.y - p1.y) * tension;

                path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
            }

            return path;
        }

        const linePath = createSmoothPath(points);

        // Create area path (fill under the line)
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${graphHeight} L ${points[0].x} ${graphHeight} Z`;

        // Get start and end labels
        const startLabel = `${monthNames[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
        const endLabel = `${monthNames[lastDate.getMonth()]} ${lastDate.getFullYear()}`;

        mobileTimeline.innerHTML = `
            <div class="mobile-timeline-track">
                <div class="mobile-timeline-graph">
                    <svg viewBox="0 0 100 ${graphHeight}" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.3)" />
                                <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
                            </linearGradient>
                        </defs>
                        <path class="mobile-timeline-area" d="${areaPath}" />
                        <path class="mobile-timeline-line" d="${linePath}" />
                    </svg>
                    <div class="mobile-timeline-indicator" id="mobile-timeline-indicator"></div>
                </div>
            </div>
            <div class="mobile-timeline-labels">
                <span class="mobile-timeline-label-item">${startLabel}</span>
                <span class="mobile-timeline-label-item">${endLabel}</span>
            </div>
            <div class="mobile-timeline-current" id="mobile-timeline-current"></div>
        `;

        // Timeline is display-only - indicator shows current position
    }

    // Update mobile timeline indicator position
    function updateMobileTimelineIndicator() {
        const indicator = document.getElementById('mobile-timeline-indicator');
        const currentLabel = document.getElementById('mobile-timeline-current');
        if (!indicator) return;

        const photo = loadedPhotos[currentIndex];
        if (!photo) return;

        const photoDate = parseLocalDate(photo.date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Calculate position based on photo index
        const position = (currentIndex / (loadedPhotos.length - 1 || 1)) * 100;

        indicator.style.left = `${position}%`;

        if (currentLabel) {
            currentLabel.textContent = `${monthNames[photoDate.getMonth()]} ${photoDate.getFullYear()} · Photo ${currentIndex + 1} of ${loadedPhotos.length}`;
        }
    }

    // Switch to photo viewing mode (from grid)
    function switchToPhotoMode(index) {
        mobileViewMode = 'photo';

        // Hide grid, show gallery (use classes only - CSS controls visibility)
        if (elements.mobileGridView) {
            elements.mobileGridView.classList.remove('active');
        }
        if (elements.galleryLayout) {
            elements.galleryLayout.classList.add('photo-mode');
        }

        // Show photo
        isProgrammaticScroll = true;
        lastProgrammaticScrollTime = Date.now();
        showPhoto(index);
        setTimeout(() => {
            isProgrammaticScroll = false;
        }, 1000);
    }

    // Switch to grid mode (from photo)
    function switchToGridMode() {
        mobileViewMode = 'grid';

        // Hide gallery, show grid (use classes only - CSS controls visibility)
        if (elements.galleryLayout) {
            elements.galleryLayout.classList.remove('photo-mode');
        }
        if (elements.mobileGridView) {
            // Clear any inline styles from swipe gestures
            elements.mobileGridView.style.opacity = '';
            elements.mobileGridView.style.transition = '';
            elements.mobileGridView.classList.add('active');
        }

        // Hide info overlay if visible
        hideMobileInfo();

        // Remove photo parameter from URL
        const newUrl = window.location.pathname;
        window.history.pushState({}, '', newUrl);
    }

    // Toggle mobile info overlay
    function toggleMobileInfo() {
        const photoMetadata = document.querySelector('.photo-metadata');
        const galleryLayout = document.querySelector('.gallery-layout');
        if (photoMetadata) {
            photoMetadata.classList.toggle('mobile-visible');
            // Also toggle class on gallery to push photo up
            if (galleryLayout) {
                galleryLayout.classList.toggle('info-visible');
            }
        }
    }

    // Hide mobile info overlay
    function hideMobileInfo() {
        const photoMetadata = document.querySelector('.photo-metadata');
        const galleryLayout = document.querySelector('.gallery-layout');
        if (photoMetadata) {
            // Also remove class from gallery
            if (galleryLayout) {
                galleryLayout.classList.remove('info-visible');
            }
            photoMetadata.classList.remove('mobile-visible');
        }
    }

    // Setup mobile event handlers
    function setupMobileHandlers() {
        // Close button - return to grid
        if (elements.mobileCloseBtn) {
            elements.mobileCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                switchToGridMode();
            });
        }

        // Info button - toggle metadata overlay
        if (elements.mobileInfoBtn) {
            elements.mobileInfoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMobileInfo();
            });
        }

        // Also allow tapping metadata panel to close it
        const photoMetadata = document.querySelector('.photo-metadata');
        if (photoMetadata) {
            photoMetadata.addEventListener('click', (e) => {
                if (e.target === photoMetadata) {
                    hideMobileInfo();
                }
            });
        }

        // Info panel close button
        const infoCloseBtn = document.getElementById('info-close-btn');
        if (infoCloseBtn) {
            infoCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                hideMobileInfo();
            });
        }

        // Swipe controls for photo navigation
        setupSwipeControls();
    }

    // Setup swipe gesture controls with interactive drag-to-dismiss
    function setupSwipeControls() {
        const photoViewer = document.querySelector('.photo-viewer');
        const mainPhoto = document.getElementById('main-photo');
        const galleryLayout = document.getElementById('gallery-layout');
        const mobileGridView = document.getElementById('mobile-grid-view');
        if (!photoViewer || !mainPhoto) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchCurrentY = 0;
        let isDraggingVertical = false;
        let isDraggingHorizontal = false;
        let dragDirection = null; // 'vertical' or 'horizontal'
        let isMultiTouch = false; // Track if pinch-zoom occurred
        const minSwipeDistance = 50;
        const dismissThreshold = 120; // Distance to trigger dismiss
        const velocityThreshold = 0.4; // Velocity to trigger dismiss
        let lastTouchY = 0;
        let lastTouchTime = 0;
        let velocity = 0;

        // Helper to reset all swipe state (preserves zoom transform)
        function resetSwipeState() {
            dragDirection = null;
            isDraggingVertical = false;
            isDraggingHorizontal = false;
            // Don't reset transform - it may contain zoom state
            // Only reset swipe-specific styles
            mainPhoto.style.opacity = '';
            mainPhoto.style.borderRadius = '';
            mainPhoto.style.transition = '';
            if (galleryLayout) {
                galleryLayout.style.background = '';
                galleryLayout.style.transition = '';
            }
            if (mobileGridView) {
                mobileGridView.classList.remove('active');
                mobileGridView.style.opacity = '';
                mobileGridView.style.transition = '';
            }
        }

        // Get the grid item position for the current photo
        function getGridItemRect() {
            const gridItem = document.querySelector(`.mobile-grid-item[data-photo-index="${currentIndex}"]`);
            if (gridItem) {
                return gridItem.getBoundingClientRect();
            }
            return null;
        }

        photoViewer.addEventListener('touchstart', (e) => {
            // Don't interfere with info panel or when zoomed
            if (document.querySelector('.photo-metadata.mobile-visible')) return;
            if (currentZoom > 1) return; // Let zoom/pan handlers take over

            // If multi-touch, mark it and reset swipe state
            if (e.touches.length > 1) {
                isMultiTouch = true;
                resetSwipeState();
                return;
            }

            // Single touch - initialize swipe tracking
            isMultiTouch = false;
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
            touchCurrentY = touchStartY;
            lastTouchY = touchStartY;
            lastTouchTime = Date.now();
            velocity = 0;
            isDraggingVertical = false;
            isDraggingHorizontal = false;
            dragDirection = null;

            // Remove transition during drag
            mainPhoto.style.transition = 'none';
            if (galleryLayout) galleryLayout.style.transition = 'none';

            // Show grid underneath during drag (hidden with opacity 0)
            if (mobileGridView) {
                mobileGridView.classList.add('active');
                mobileGridView.style.opacity = '0';
                mobileGridView.style.transition = 'none';
            }
        }, { passive: true });

        photoViewer.addEventListener('touchmove', (e) => {
            // Don't interfere with info panel or when zoomed
            if (document.querySelector('.photo-metadata.mobile-visible')) return;
            if (currentZoom > 1) return; // Let zoom/pan handlers take over

            // If multi-touch detected, mark it and reset swipe state
            if (e.touches.length > 1) {
                if (!isMultiTouch) {
                    isMultiTouch = true;
                    resetSwipeState();
                }
                return; // Allow native pinch-zoom
            }

            // Skip if we already detected multi-touch in this gesture
            if (isMultiTouch) return;

            const currentX = e.changedTouches[0].clientX;
            const currentY = e.changedTouches[0].clientY;
            const deltaX = currentX - touchStartX;
            const deltaY = currentY - touchStartY;

            // Determine drag direction on first significant movement
            if (!dragDirection && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    dragDirection = 'vertical';
                    isDraggingVertical = true;
                } else {
                    dragDirection = 'horizontal';
                    isDraggingHorizontal = true;
                }
            }

            // Handle vertical drag (dismiss gesture)
            if (dragDirection === 'vertical' && deltaY > 0) {
                touchCurrentY = currentY;

                // Calculate velocity
                const now = Date.now();
                const dt = now - lastTouchTime;
                if (dt > 0) {
                    velocity = (currentY - lastTouchY) / dt;
                }
                lastTouchY = currentY;
                lastTouchTime = now;

                // Calculate progress (0 to 1)
                const progress = Math.min(deltaY / dismissThreshold, 1);

                // Scale down more dramatically (to 60% at full progress)
                const scale = 1 - (progress * 0.4);

                // Round corners as it shrinks
                const borderRadius = progress * 16;

                // Apply transform - photo follows finger and shrinks
                mainPhoto.style.transform = `translateY(${deltaY}px) scale(${scale})`;
                mainPhoto.style.borderRadius = `${borderRadius}px`;

                // Fade the photo viewer background to reveal grid
                if (galleryLayout) {
                    galleryLayout.style.background = `rgba(0, 0, 0, ${1 - progress * 0.8})`;
                }

                // Show grid underneath
                if (mobileGridView) {
                    mobileGridView.style.opacity = String(progress * 0.8);
                }
            }
        }, { passive: true });

        photoViewer.addEventListener('touchend', (e) => {
            // Don't interfere with info panel or when zoomed
            if (document.querySelector('.photo-metadata.mobile-visible')) return;
            if (currentZoom > 1) return; // Let zoom/pan handlers take over

            // If multi-touch occurred during this gesture, skip swipe processing
            if (isMultiTouch) {
                isMultiTouch = false;
                return;
            }

            // No drag direction means no swipe gesture started
            if (!dragDirection) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Handle vertical dismiss
            if (dragDirection === 'vertical' && deltaY > 0) {
                const shouldDismiss = deltaY > dismissThreshold || velocity > velocityThreshold;

                if (shouldDismiss) {
                    // Get target grid item position
                    const gridRect = getGridItemRect();
                    const photoRect = mainPhoto.getBoundingClientRect();

                    // Calculate where to animate to
                    let targetX = 0;
                    let targetY = window.innerHeight;
                    let targetScale = 0.3;

                    if (gridRect) {
                        // Animate toward the grid item
                        const photoCenterX = photoRect.left + photoRect.width / 2;
                        const photoCenterY = photoRect.top + photoRect.height / 2;
                        const gridCenterX = gridRect.left + gridRect.width / 2;
                        const gridCenterY = gridRect.top + gridRect.height / 2;

                        targetX = gridCenterX - photoCenterX;
                        targetY = gridCenterY - photoCenterY;
                        targetScale = gridRect.width / photoRect.width;
                    }

                    // Re-enable transitions for smooth animation
                    mainPhoto.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out, border-radius 0.25s ease-out';
                    if (galleryLayout) galleryLayout.style.transition = 'background 0.25s ease-out';
                    if (mobileGridView) mobileGridView.style.transition = 'opacity 0.25s ease-out';

                    // Animate to grid position
                    mainPhoto.style.transform = `translate(${targetX}px, ${targetY}px) scale(${targetScale})`;
                    mainPhoto.style.opacity = '0';
                    mainPhoto.style.borderRadius = '8px';

                    if (galleryLayout) galleryLayout.style.background = 'transparent';
                    if (mobileGridView) mobileGridView.style.opacity = '1';

                    setTimeout(() => {
                        // Reset styles before switching
                        mainPhoto.style.transition = '';
                        mainPhoto.style.transform = '';
                        mainPhoto.style.opacity = '';
                        mainPhoto.style.borderRadius = '';
                        if (galleryLayout) {
                            galleryLayout.style.transition = '';
                            galleryLayout.style.background = '';
                        }
                        if (mobileGridView) {
                            mobileGridView.style.transition = '';
                        }
                        switchToGridMode();
                    }, 250);
                } else {
                    // Spring back to original position
                    mainPhoto.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease, border-radius 0.3s ease';
                    if (galleryLayout) galleryLayout.style.transition = 'background 0.3s ease';
                    if (mobileGridView) mobileGridView.style.transition = 'opacity 0.3s ease';

                    mainPhoto.style.transform = '';
                    mainPhoto.style.opacity = '';
                    mainPhoto.style.borderRadius = '';
                    if (galleryLayout) galleryLayout.style.background = '';
                    if (mobileGridView) mobileGridView.style.opacity = '0';

                    // Clean up after animation
                    setTimeout(() => {
                        mainPhoto.style.transition = '';
                        if (galleryLayout) galleryLayout.style.transition = '';
                        if (mobileGridView) {
                            mobileGridView.classList.remove('active');
                            mobileGridView.style.transition = '';
                            mobileGridView.style.opacity = '';
                        }
                    }, 300);
                }
                return;
            }

            // Handle horizontal swipe for navigation
            if (dragDirection === 'horizontal' && Math.abs(deltaX) > minSwipeDistance) {
                // Reset any transforms
                mainPhoto.style.transform = '';
                mainPhoto.style.opacity = '';
                mainPhoto.style.borderRadius = '';
                mainPhoto.style.transition = '';
                if (galleryLayout) {
                    galleryLayout.style.background = '';
                    galleryLayout.style.transition = '';
                }
                if (mobileGridView) {
                    mobileGridView.classList.remove('active');
                    mobileGridView.style.opacity = '';
                    mobileGridView.style.transition = '';
                }

                if (deltaX < 0) {
                    navigatePhoto('next');
                } else {
                    navigatePhoto('prev');
                }
                return;
            }

            // Handle swipe up for info panel
            if (dragDirection === 'vertical' && deltaY < -minSwipeDistance) {
                mainPhoto.style.transform = '';
                mainPhoto.style.opacity = '';
                mainPhoto.style.borderRadius = '';
                mainPhoto.style.transition = '';
                if (galleryLayout) {
                    galleryLayout.style.background = '';
                    galleryLayout.style.transition = '';
                }
                if (mobileGridView) {
                    mobileGridView.classList.remove('active');
                    mobileGridView.style.opacity = '';
                    mobileGridView.style.transition = '';
                }
                toggleMobileInfo();
                return;
            }

            // Reset if no action taken
            mainPhoto.style.transition = 'transform 0.3s ease, opacity 0.3s ease, border-radius 0.3s ease';
            mainPhoto.style.transform = '';
            mainPhoto.style.opacity = '';
            mainPhoto.style.borderRadius = '';
            if (mobileGridView) {
                mobileGridView.style.transition = 'opacity 0.3s ease';
                mobileGridView.style.opacity = '0';
            }
            setTimeout(() => {
                mainPhoto.style.transition = '';
                if (galleryLayout) {
                    galleryLayout.style.background = '';
                    galleryLayout.style.transition = '';
                }
                if (mobileGridView) {
                    mobileGridView.classList.remove('active');
                    mobileGridView.style.opacity = '';
                    mobileGridView.style.transition = '';
                }
            }, 300);
        }, { passive: true });

        // Swipe down on info panel to close it
        const infoPanel = document.querySelector('.photo-metadata');
        if (infoPanel) {
            let infoTouchStartY = 0;

            infoPanel.addEventListener('touchstart', (e) => {
                infoTouchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            infoPanel.addEventListener('touchend', (e) => {
                const infoTouchEndY = e.changedTouches[0].screenY;
                const deltaY = infoTouchEndY - infoTouchStartY;

                if (deltaY > minSwipeDistance) {
                    hideMobileInfo();
                }
            }, { passive: true });
        }
    }

    // Show specific photo
    function showPhoto(index, skipScroll = false, smoothScroll = true) {
        if (index < 0 || index >= loadedPhotos.length) return;

        currentIndex = index;
        const photo = loadedPhotos[index];

        // Update URL with photo number (1-indexed for user-friendly URLs)
        const photoNumber = index + 1;
        const newUrl = `${window.location.pathname}?photo=${photoNumber}`;
        window.history.pushState({ photoIndex: index }, '', newUrl);

        // Reset zoom when changing photos
        resetZoom();

        // Fade out
        elements.mainPhoto.classList.remove('visible');

        setTimeout(() => {
            elements.mainPhoto.src = photo.src || (imagePath + photo.file);

            // Detect orientation and set data attribute
            const orientation = photo.width > photo.height ? 'landscape' : 'portrait';
            elements.mainPhoto.setAttribute('data-orientation', orientation);

            // Update basic info
            const date = parseLocalDate(photo.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            elements.photoDate.textContent = formattedDate;

            // Update location if available
            if (photo.exif && photo.exif.latitude && photo.exif.longitude) {
                // Show loading state
                elements.photoLocation.textContent = 'Loading location...';
                elements.locationItem.style.display = 'block';

                // Fetch location name via reverse geocoding
                reverseGeocode(photo.exif.latitude, photo.exif.longitude)
                    .then(locationName => {
                        elements.photoLocation.textContent = locationName;
                    })
                    .catch(error => {
                        console.warn('Reverse geocoding failed:', error);
                        // Fallback to coordinates
                        const lat = photo.exif.latitude.toFixed(6);
                        const lon = photo.exif.longitude.toFixed(6);
                        const latDir = photo.exif.latitude >= 0 ? 'N' : 'S';
                        const lonDir = photo.exif.longitude >= 0 ? 'E' : 'W';
                        elements.photoLocation.textContent = `${Math.abs(lat)}° ${latDir}, ${Math.abs(lon)}° ${lonDir}`;
                    });
            } else {
                elements.photoLocation.textContent = '—';
                elements.locationItem.style.display = 'block';
            }

            elements.photoFilename.textContent = photo.file;
            elements.photoCount.textContent = `Photo ${index + 1} of ${loadedPhotos.length}`;

            // Update dimensions
            const aspectRatio = calculateAspectRatio(photo.width, photo.height);
            elements.photoDimensions.textContent = `${photo.width} × ${photo.height}px`;
            elements.photoAspect.textContent = aspectRatio;

            // Always show EXIF section
            elements.exifSection.style.display = 'block';

            // Camera
            const camera = photo.exif ? [photo.exif.Make, photo.exif.Model].filter(Boolean).join(' ') : '';
            elements.photoCamera.textContent = camera || '—';

            // Settings (ISO, Aperture, Shutter Speed, Focal Length)
            const settings = [];
            if (photo.exif?.ISO) settings.push(`ISO ${photo.exif.ISO}`);
            if (photo.exif?.FNumber) settings.push(`f/${photo.exif.FNumber}`);
            if (photo.exif?.ExposureTime) {
                const shutterSpeed = photo.exif.ExposureTime < 1
                    ? `1/${Math.round(1 / photo.exif.ExposureTime)}s`
                    : `${photo.exif.ExposureTime}s`;
                settings.push(shutterSpeed);
            }
            if (photo.exif?.FocalLength) {
                settings.push(`${photo.exif.FocalLength}mm`);
            }
            elements.photoSettings.textContent = settings.length > 0 ? settings.join(' · ') : '—';

            // Flash
            if (photo.exif?.Flash !== undefined) {
                const flashFired = (photo.exif.Flash & 0x01) !== 0;
                elements.photoFlash.textContent = flashFired ? 'Fired' : 'Not Fired';
            } else {
                elements.photoFlash.textContent = '—';
            }
            elements.flashItem.style.display = 'block';

            // Color Space
            if (photo.exif?.ColorSpace !== undefined) {
                const colorSpaceMap = { 1: 'sRGB', 65535: 'Uncalibrated', 2: 'Adobe RGB' };
                elements.photoColorSpace.textContent = colorSpaceMap[photo.exif.ColorSpace] || photo.exif.ColorSpace;
            } else {
                elements.photoColorSpace.textContent = '—';
            }
            elements.colorSpaceItem.style.display = 'block';

            // Software
            elements.photoSoftware.textContent = photo.exif?.Software || '—';
            elements.softwareItem.style.display = 'block';

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
        const photoDate = parseLocalDate(photo.date);
        const photoMonthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;
        const currentMonth = photoDate.getMonth(); // 0 = Jan, 1 = Feb, 11 = Dec
        const currentYear = photoDate.getFullYear();

        // Determine which year label to hide (if any)
        let yearToHide = null;
        if (currentMonth === 11) {
            // Viewing December - hide next year's January label
            yearToHide = `${currentYear + 1}-01`;
        } else if (currentMonth === 1) {
            // Viewing February - hide current year's January label
            yearToHide = `${currentYear}-01`;
        }

        document.querySelectorAll('.tick-mark').forEach((tick) => {
            const label = tick.querySelector('.tick-label');

            if (tick.dataset.monthKey === photoMonthKey) {
                tick.classList.add('active');
                // If this is January, show month name instead of year
                if (label.dataset.year && label.dataset.month) {
                    label.textContent = label.dataset.month;
                }
            } else {
                tick.classList.remove('active');
                // If this is a year label (January), restore or hide
                if (label.dataset.year) {
                    // Hide only the specific adjacent year label
                    if (tick.dataset.monthKey === yearToHide) {
                        label.style.opacity = '0';
                    } else {
                        label.style.opacity = '';
                        label.textContent = label.dataset.year;
                    }
                }
            }
        });

        // Scroll to active tick (unless we're scrolling manually)
        if (!skipScroll) {
            scrollToActiveThumb(index, smoothScroll);
        }

        // Update navigation button states
        updateNavigationButtons();

        // Update mobile timeline indicator
        if (isMobile) {
            updateMobileTimelineIndicator();
        }
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
    function scrollToActiveThumb(index, smooth = true) {
        const photo = loadedPhotos[index];
        if (!photo) return;

        // Find the tick mark that matches this photo's month
        const photoDate = parseLocalDate(photo.date);
        const photoMonthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;

        const ticks = document.querySelectorAll('.tick-mark');
        for (let tick of ticks) {
            if (tick.dataset.monthKey === photoMonthKey) {
                const scrollContainer = elements.timelineScroll;

                // With padding: 0 50%, the padding naturally centers content
                // We just need to scroll to the tick's center position
                const tickOffsetLeft = tick.offsetLeft;
                const tickWidth = tick.offsetWidth;
                const tickCenter = tickOffsetLeft + (tickWidth / 2);

                // Scroll so the tick center aligns with the arrow (viewport center)
                scrollContainer.scrollTo({
                    left: tickCenter,
                    behavior: smooth ? 'smooth' : 'auto'
                });
                break;
            }
        }
    }

    // Timeline scroll handler - update photo based on centered tick
    let scrollTimeout;
    let isProgrammaticScroll = false;
    let isProgrammaticScrollTimeout = null;
    let lastScrollUpdate = 0;
    let lastProgrammaticScrollTime = 0;

    function updatePhotoFromScroll() {
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

        if (closestTick && closestTick.dataset.monthKey) {
            const centeredMonthKey = closestTick.dataset.monthKey;

            // Get current photo's month
            const currentPhoto = loadedPhotos[currentIndex];
            if (currentPhoto) {
                const currentPhotoDate = parseLocalDate(currentPhoto.date);
                const currentMonthKey = `${currentPhotoDate.getFullYear()}-${String(currentPhotoDate.getMonth() + 1).padStart(2, '0')}`;

                // Only change photo if we've scrolled to a DIFFERENT month
                if (centeredMonthKey !== currentMonthKey) {
                    // Find the first photo in the centered month
                    const photoIndex = loadedPhotos.findIndex(photo => {
                        const photoDate = parseLocalDate(photo.date);
                        const photoMonthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;
                        return photoMonthKey === centeredMonthKey;
                    });

                    if (photoIndex !== -1) {
                        showPhoto(photoIndex, true); // Skip scroll to avoid loop
                    }
                }
            }

            return closestTick;
        }
        return null;
    }

    elements.timelineScroll.addEventListener('scroll', () => {
        // Skip if we're programmatically scrolling from navigation
        if (isProgrammaticScroll) return;

        // Skip if a programmatic scroll happened recently (within 2 seconds)
        const now = Date.now();
        const timeSinceLastProgrammaticScroll = now - lastProgrammaticScrollTime;
        if (timeSinceLastProgrammaticScroll < 2000) return;

        // Throttle updates while scrolling - update immediately but not more than every 50ms
        if (now - lastScrollUpdate > 50) {
            updatePhotoFromScroll();
            lastScrollUpdate = now;
        }

        // Snap to center after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const closestTick = updatePhotoFromScroll();

            if (closestTick) {
                const scrollContainer = elements.timelineScroll;
                const containerRect = scrollContainer.getBoundingClientRect();
                const containerCenterX = containerRect.left + (containerRect.width / 2);
                const tickRect = closestTick.getBoundingClientRect();
                const tickCenterX = tickRect.left + (tickRect.width / 2);
                const scrollLeft = scrollContainer.scrollLeft + (tickCenterX - containerCenterX);

                scrollContainer.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }, 150); // Snap to center after scrolling stops
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
            clearTimeout(isProgrammaticScrollTimeout);
            isProgrammaticScroll = true;
            lastProgrammaticScrollTime = Date.now();
            showPhoto(newIndex, false, false); // Use instant scroll for arrow navigation
            isProgrammaticScrollTimeout = setTimeout(() => {
                isProgrammaticScroll = false;
            }, 300); // Longer delay to ensure scroll events settle
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

    // Reverse geocoding function
    async function reverseGeocode(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'Photography Gallery/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding request failed');
            }

            const data = await response.json();

            // Extract city/town information
            const address = data.address || {};
            const location = address.city ||
                           address.town ||
                           address.village ||
                           address.hamlet ||
                           address.county ||
                           address.state ||
                           'Unknown Location';

            // Add country if available
            const country = address.country;
            return country ? `${location}, ${country}` : location;

        } catch (error) {
            throw error;
        }
    }

    // Dynamic zoom functionality
    let currentZoom = 1;
    let minZoom = 1;
    let maxZoom = 4;
    let zoomStep = 0.1;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let translateX = 0;
    let translateY = 0;

    function updatePhotoTransform() {
        if (currentZoom === 1 && translateX === 0 && translateY === 0) {
            // Reset to default state
            elements.mainPhoto.style.transform = '';
            elements.mainPhoto.classList.remove('zoomable');
        } else {
            const transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
            elements.mainPhoto.style.transform = transform;

            if (currentZoom > 1) {
                elements.mainPhoto.classList.add('zoomable');
            } else {
                elements.mainPhoto.classList.remove('zoomable');
            }
        }

        // Update zoom level display
        if (elements.zoomLevel) {
            elements.zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
        }

        // Update button states
        if (elements.zoomIn && elements.zoomOut && elements.zoomReset) {
            if (currentZoom >= maxZoom) {
                elements.zoomIn.classList.add('disabled');
            } else {
                elements.zoomIn.classList.remove('disabled');
            }

            if (currentZoom <= minZoom) {
                elements.zoomOut.classList.add('disabled');
            } else {
                elements.zoomOut.classList.remove('disabled');
            }

            if (currentZoom === 1) {
                elements.zoomReset.classList.add('disabled');
            } else {
                elements.zoomReset.classList.remove('disabled');
            }
        }
    }

    function resetZoom() {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updatePhotoTransform();
    }

    // Mouse wheel and trackpad zoom
    elements.mainPhoto.addEventListener('wheel', (e) => {
        // Only zoom if it's a pinch gesture (ctrlKey) or regular scroll
        // This handles both mouse wheel and trackpad pinch-to-zoom
        if (e.ctrlKey || e.deltaY !== 0) {
            e.preventDefault();

            const oldZoom = currentZoom;

            // Determine zoom direction and speed
            // Trackpad pinch sends smaller deltaY values, so adjust accordingly
            const zoomAmount = Math.abs(e.deltaY) > 50 ? zoomStep : zoomStep * 0.5;

            // Zoom in or out
            if (e.deltaY < 0) {
                currentZoom = Math.min(currentZoom + zoomAmount, maxZoom);
            } else {
                currentZoom = Math.max(currentZoom - zoomAmount, minZoom);
            }

            // If zoom changed, update transform
            if (currentZoom !== oldZoom) {
                updatePhotoTransform();
            }
        }
    }, { passive: false });

    // Drag to pan when zoomed
    elements.mainPhoto.addEventListener('mousedown', (e) => {
        if (currentZoom > 1) {
            e.preventDefault();
            isDragging = true;
            dragStartX = e.clientX - translateX;
            dragStartY = e.clientY - translateY;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && currentZoom > 1) {
            e.preventDefault();
            const newTranslateX = e.clientX - dragStartX;
            const newTranslateY = e.clientY - dragStartY;

            // Constrain panning so image doesn't get lost behind panels
            const rect = elements.mainPhoto.getBoundingClientRect();
            const containerRect = elements.mainPhoto.parentElement.getBoundingClientRect();

            // Calculate scaled dimensions
            const scaledWidth = rect.width * currentZoom;
            const scaledHeight = rect.height * currentZoom;

            // Calculate maximum allowed translation
            const maxTranslateX = Math.max(0, (scaledWidth - containerRect.width) / 2);
            const maxTranslateY = Math.max(0, (scaledHeight - containerRect.height) / 2);

            // Constrain translation
            translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
            translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));

            updatePhotoTransform();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch support for pinch-zoom and pan
    let touchStartDistance = 0;
    let touchStartZoom = 1;
    let touchStartTranslateX = 0;
    let touchStartTranslateY = 0;
    let touchStartCenterX = 0;
    let touchStartCenterY = 0;
    let lastPinchCenterX = 0;
    let lastPinchCenterY = 0;
    let touchPanStartX = 0;
    let touchPanStartY = 0;
    let touchPanTranslateX = 0;
    let touchPanTranslateY = 0;
    let isTouchPanning = false;
    let lastTapTime = 0;
    const doubleTapDelay = 300;

    // Helper to get pinch center
    function getPinchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    // Helper to get touch distance
    function getTouchDistance(touches) {
        return Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
        );
    }

    // Helper to get CONTAINER center (fixed reference point, not affected by transforms)
    function getContainerCenter() {
        const rect = elements.mainPhoto.parentElement.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    // Helper to constrain pan within image bounds
    function constrainPan(tx, ty, zoom) {
        const container = elements.mainPhoto.parentElement.getBoundingClientRect();
        const img = elements.mainPhoto;

        // If image not loaded yet, no constraints
        if (!img.naturalWidth || !img.naturalHeight) {
            return { x: tx, y: ty };
        }

        // Calculate displayed image size (object-fit: contain)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = container.width / container.height;
        let displayedWidth, displayedHeight;

        if (imgAspect > containerAspect) {
            displayedWidth = container.width;
            displayedHeight = container.width / imgAspect;
        } else {
            displayedHeight = container.height;
            displayedWidth = container.height * imgAspect;
        }

        // Max pan = how much scaled image extends beyond container
        const scaledWidth = displayedWidth * zoom;
        const scaledHeight = displayedHeight * zoom;
        const maxX = Math.max(0, (scaledWidth - container.width) / 2);
        const maxY = Math.max(0, (scaledHeight - container.height) / 2);

        return {
            x: Math.max(-maxX, Math.min(maxX, tx)),
            y: Math.max(-maxY, Math.min(maxY, ty))
        };
    }

    // Helper to animate pan snap-back
    function animatePanTo(targetX, targetY, duration = 200) {
        elements.mainPhoto.style.transition = `transform ${duration}ms ease-out`;
        translateX = targetX;
        translateY = targetY;
        updatePhotoTransform();
        setTimeout(() => {
            elements.mainPhoto.style.transition = '';
        }, duration);
    }

    // Helper to animate zoom snap-back
    function animateZoomTo(targetZoom, targetX, targetY, duration = 200) {
        elements.mainPhoto.style.transition = `transform ${duration}ms ease-out`;
        currentZoom = targetZoom;
        translateX = targetX;
        translateY = targetY;
        updatePhotoTransform();
        setTimeout(() => {
            elements.mainPhoto.style.transition = '';
        }, duration);
    }

    elements.mainPhoto.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Pinch-zoom start
            e.preventDefault();
            isTouchPanning = false;
            touchStartDistance = getTouchDistance(e.touches);
            touchStartZoom = currentZoom;
            touchStartTranslateX = translateX;
            touchStartTranslateY = translateY;
            const center = getPinchCenter(e.touches);
            touchStartCenterX = center.x;
            touchStartCenterY = center.y;
            lastPinchCenterX = center.x;
            lastPinchCenterY = center.y;
        } else if (e.touches.length === 1 && currentZoom > 1) {
            // Single touch pan when zoomed
            e.preventDefault();
            isTouchPanning = true;
            touchPanStartX = e.touches[0].clientX;
            touchPanStartY = e.touches[0].clientY;
            touchPanTranslateX = translateX;
            touchPanTranslateY = translateY;
        }
    }, { passive: false });

    elements.mainPhoto.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            // Pinch-zoom with pan
            e.preventDefault();
            isTouchPanning = false;

            const currentDistance = getTouchDistance(e.touches);
            const currentCenter = getPinchCenter(e.touches);

            if (touchStartDistance > 0) {
                // Calculate new zoom
                const scale = currentDistance / touchStartDistance;
                const newZoom = Math.min(Math.max(touchStartZoom * scale, minZoom), maxZoom);

                // Get CONTAINER center (fixed reference point)
                const containerCenter = getContainerCenter();

                // Calculate offset from container center to pinch start point
                const offsetX = touchStartCenterX - containerCenter.x;
                const offsetY = touchStartCenterY - containerCenter.y;

                // Zoom toward pinch center: adjust translation so pinch point stays stationary
                // Formula: newTranslate = oldTranslate + offset * (1 - newScale/oldScale)
                const zoomRatio = newZoom / touchStartZoom;
                let newTranslateX = touchStartTranslateX + offsetX * (1 - zoomRatio);
                let newTranslateY = touchStartTranslateY + offsetY * (1 - zoomRatio);

                // Add pan movement (how much the pinch center has moved)
                const panDeltaX = currentCenter.x - touchStartCenterX;
                const panDeltaY = currentCenter.y - touchStartCenterY;
                newTranslateX += panDeltaX;
                newTranslateY += panDeltaY;

                currentZoom = newZoom;
                translateX = newTranslateX;
                translateY = newTranslateY;

                lastPinchCenterX = currentCenter.x;
                lastPinchCenterY = currentCenter.y;

                updatePhotoTransform();
            }
        } else if (e.touches.length === 1 && isTouchPanning && currentZoom > 1) {
            // Pan when zoomed
            e.preventDefault();
            const deltaX = e.touches[0].clientX - touchPanStartX;
            const deltaY = e.touches[0].clientY - touchPanStartY;

            translateX = touchPanTranslateX + deltaX;
            translateY = touchPanTranslateY + deltaY;

            updatePhotoTransform();
        }
    }, { passive: false });

    elements.mainPhoto.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            touchStartDistance = 0;
        }
        if (e.touches.length === 0) {
            isTouchPanning = false;

            // Snap-back zoom if below minimum
            if (currentZoom < minZoom) {
                animateZoomTo(minZoom, 0, 0);
                return;
            }

            // Only reset zoom if actually at or below minimum
            if (currentZoom <= 1) {
                animateZoomTo(1, 0, 0);
            } else {
                // Constrain pan and animate snap-back if needed
                const constrained = constrainPan(translateX, translateY, currentZoom);
                if (constrained.x !== translateX || constrained.y !== translateY) {
                    animatePanTo(constrained.x, constrained.y);
                }
            }

            // Double-tap detection
            const now = Date.now();
            if (now - lastTapTime < doubleTapDelay) {
                // Double-tap detected - toggle zoom
                if (currentZoom > 1) {
                    // Reset to 1x with animation
                    animateZoomTo(1, 0, 0);
                } else {
                    // Zoom to 2x at tap point using container center
                    const touch = e.changedTouches[0];
                    const containerCenter = getContainerCenter();
                    const offsetX = touch.clientX - containerCenter.x;
                    const offsetY = touch.clientY - containerCenter.y;
                    // Constrain the zoom translation
                    const constrained = constrainPan(-offsetX, -offsetY, 2);
                    animateZoomTo(2, constrained.x, constrained.y);
                }
                lastTapTime = 0; // Reset to prevent triple-tap
            } else {
                lastTapTime = now;
            }
        }
    });

    // Swipe navigation for mobile
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeStartTime = 0;
    const swipeThreshold = 50; // minimum distance for swipe
    const swipeTimeLimit = 300; // maximum time for swipe gesture

    document.querySelector('.photo-viewer').addEventListener('touchstart', (e) => {
        // Only track single finger swipes when not zoomed
        if (e.touches.length === 1 && currentZoom === 1) {
            swipeStartX = e.touches[0].clientX;
            swipeStartY = e.touches[0].clientY;
            swipeStartTime = Date.now();
        }
    }, { passive: true });

    document.querySelector('.photo-viewer').addEventListener('touchend', (e) => {
        if (currentZoom !== 1) return; // Don't swipe when zoomed
        if (swipeStartX === 0) return;

        const swipeEndX = e.changedTouches[0].clientX;
        const swipeEndY = e.changedTouches[0].clientY;
        const swipeTime = Date.now() - swipeStartTime;

        const deltaX = swipeEndX - swipeStartX;
        const deltaY = swipeEndY - swipeStartY;

        // Check if horizontal swipe (more horizontal than vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY) &&
            Math.abs(deltaX) > swipeThreshold &&
            swipeTime < swipeTimeLimit) {

            if (deltaX > 0) {
                // Swipe right - go to previous
                navigatePhoto('prev');
            } else {
                // Swipe left - go to next
                navigatePhoto('next');
            }
        }

        // Reset
        swipeStartX = 0;
        swipeStartY = 0;
    }, { passive: true });

    // Zoom button controls
    if (elements.zoomIn) {
        elements.zoomIn.addEventListener('click', () => {
            if (currentZoom < maxZoom) {
                currentZoom = Math.min(currentZoom + 0.25, maxZoom);
                updatePhotoTransform();
            }
        });
    }

    if (elements.zoomOut) {
        elements.zoomOut.addEventListener('click', () => {
            if (currentZoom > minZoom) {
                currentZoom = Math.max(currentZoom - 0.25, minZoom);
                if (currentZoom === 1) {
                    translateX = 0;
                    translateY = 0;
                }
                updatePhotoTransform();
            }
        });
    }

    if (elements.zoomReset) {
        elements.zoomReset.addEventListener('click', () => {
            resetZoom();
        });
    }

    // Double-click to reset zoom or zoom to 2x
    elements.mainPhoto.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (currentZoom > 1) {
            resetZoom();
        } else {
            currentZoom = 2;
            translateX = 0;
            translateY = 0;
            updatePhotoTransform();
        }
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.photoIndex !== undefined) {
            clearTimeout(isProgrammaticScrollTimeout);
            isProgrammaticScroll = true;
            lastProgrammaticScrollTime = Date.now();
            showPhoto(e.state.photoIndex, false, false); // Use instant scroll
            isProgrammaticScrollTimeout = setTimeout(() => {
                isProgrammaticScroll = false;
            }, 300);
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // ESC key behavior
        if (e.key === 'Escape') {
            // First, try to close mobile info if visible
            const photoMetadata = document.querySelector('.photo-metadata');
            if (photoMetadata && photoMetadata.classList.contains('mobile-visible')) {
                hideMobileInfo();
                return;
            }

            // If zoomed, reset zoom
            if (currentZoom > 1) {
                resetZoom();
                return;
            }

            // On mobile, return to grid
            if (isMobile && mobileViewMode === 'photo') {
                switchToGridMode();
                return;
            }
        }

        if (e.key === 'r' || e.key === 'R') {
            // Reload the gallery
            console.log('Reloading gallery...');
            location.reload();
            return;
        }

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

