/**
 * Photography Gallery - Auto Photo Loader
 * Add your photos to the images array below with their dates
 */

(function() {
    'use strict';

    // === CONFIGURATION ===
    // Photos will be auto-loaded from the API
    let photos = [];

    // === AUTO-LOAD SYSTEM ===
    const imagePath = 'images/';
    let currentIndex = 0;
    let loadedPhotos = [];

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
        zoomLevel: document.getElementById('zoom-level')
    };

    // Fetch photos from API
    async function fetchPhotos() {
        try {
            const response = await fetch('/api/photos');
            if (!response.ok) {
                throw new Error('Failed to fetch photos');
            }
            photos = await response.json();
            console.log(`Fetched ${photos.length} photos from API`);
            return true;
        } catch (error) {
            console.error('Error fetching photos:', error);
            // Show error message
            elements.loading.textContent = 'Error loading photo list. Make sure the server is running.';
            return false;
        }
    }

    // Initialize gallery
    async function init() {
        // Fetch photos from API first
        const success = await fetchPhotos();
        if (!success) {
            return;
        }

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
        elements.galleryLayout.style.display = 'flex';

        buildTimeline();

        // Wait for timeline to render before showing photo
        setTimeout(() => {
            isProgrammaticScroll = true;

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

            showPhoto(initialIndex);
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
                        showPhoto(photo.globalIndex);
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
    }

    // Show specific photo
    function showPhoto(index, skipScroll = false) {
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
            const date = new Date(photo.date);
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
        const photoDate = new Date(photo.date);
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
    let lastScrollUpdate = 0;

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

        // Find the first photo in that month and show it
        if (closestTick && closestTick.dataset.monthKey) {
            const monthKey = closestTick.dataset.monthKey;
            const photoIndex = loadedPhotos.findIndex(photo => {
                const photoDate = new Date(photo.date);
                const photoMonthKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`;
                return photoMonthKey === monthKey;
            });

            if (photoIndex !== -1 && photoIndex !== currentIndex) {
                showPhoto(photoIndex, true); // Skip scroll to avoid loop
            }

            return closestTick;
        }
        return null;
    }

    elements.timelineScroll.addEventListener('scroll', () => {
        // Skip if we're programmatically scrolling from navigation
        if (isProgrammaticScroll) return;

        // Throttle updates while scrolling - update immediately but not more than every 50ms
        const now = Date.now();
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

    // Touch support for tablets/touchscreen laptops
    let touchStartDistance = 0;
    let touchStartZoom = 1;

    elements.mainPhoto.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            touchStartZoom = currentZoom;
        }
    }, { passive: false });

    elements.mainPhoto.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const touchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (touchStartDistance > 0) {
                const scale = touchDistance / touchStartDistance;
                currentZoom = Math.min(Math.max(touchStartZoom * scale, minZoom), maxZoom);
                updatePhotoTransform();
            }
        }
    }, { passive: false });

    elements.mainPhoto.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            touchStartDistance = 0;
        }
    });

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
            isProgrammaticScroll = true;
            showPhoto(e.state.photoIndex, false);
            setTimeout(() => {
                isProgrammaticScroll = false;
            }, 600);
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // ESC key to reset zoom
        if (e.key === 'Escape' && currentZoom > 1) {
            resetZoom();
            return;
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
