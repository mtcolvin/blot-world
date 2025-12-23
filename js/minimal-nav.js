/**
 * Minimal Nav - Dynamic Logo Color
 * Detects when nav is over dark backgrounds and applies complementary colors
 */

(function() {
    'use strict';

    const nav = document.querySelector('nav.minimal-nav');
    const logoFill = document.querySelector('.logo-fill');

    // Override click to redirect to last viewed section
    if (nav) {
        // Get the base path from inline onclick before removing it
        // Format: onclick="window.location.href='../../index.html'"
        const onclickAttr = nav.getAttribute('onclick') || '';
        const hrefMatch = onclickAttr.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        const basePath = hrefMatch ? hrefMatch[1] : 'index.html';

        // Remove the inline onclick since we're handling it via JS
        nav.removeAttribute('onclick');

        nav.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            let lastSection = 'home';
            let lastFilters = '';
            try {
                lastSection = localStorage.getItem('blot-last-section') || 'home';
                lastFilters = localStorage.getItem('blot-last-filters') || '';
            } catch (err) {}

            // Build the URL with filters and hash
            let targetUrl = basePath;
            if (lastSection === 'projects' && lastFilters) {
                targetUrl += '?' + lastFilters;
            }
            if (lastSection !== 'home') {
                targetUrl += '#' + lastSection;
            }

            // Create and show page transition loader
            const loaderGifs = [
                'akuakua_a_far_away_total_solar_eclipse_in_a_sea_of_pure_black_cb4c7c01-ef1d-4139-b7a5-dc49cacefea2_1.gif',
                'akuakua_space-related_nes_aesthetic_8_bit_pixel_images_for_we_023141ec-734b-4726-b355-caa6f1f96e0f_1.gif',
                'akuakua_space-related_nes_aesthetic_8_bit_pixel_images_for_we_b62fe4d4-a1c4-440c-9f7b-252cb1c4d887_0.gif',
                'akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_6cda2543-228f-4ea4-842c-353a2b18a985_1.gif',
                'akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_95f256d7-d9da-4db1-b60e-6c7d95b316f8_1.gif',
                'akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_c0b67235-2101-4274-b854-9fa0f8f85d25_0.gif',
                'akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_ed5c0816-dfd1-47aa-b5eb-1e7805171470_2.gif'
            ];
            const randomGif = loaderGifs[Math.floor(Math.random() * loaderGifs.length)];

            // Determine correct path based on page depth
            const pathPrefix = basePath.includes('../../') ? '../../' : '';
            const gifSrc = pathPrefix + 'images/loaders/' + randomGif;

            // Create loader overlay
            const loader = document.createElement('div');
            loader.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;display:flex;justify-content:center;align-items:center;z-index:999999;';

            const content = document.createElement('div');
            content.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;';

            const img = document.createElement('img');
            img.src = gifSrc;
            img.style.cssText = 'width:150px;height:150px;object-fit:contain;image-rendering:pixelated;';

            const loadingBar = document.createElement('div');
            loadingBar.style.cssText = 'width:150px;height:24px;font-family:monospace;font-size:12px;color:#fff;letter-spacing:1px;text-align:left;border:1px solid #fff;padding:4px 0 4px 6px;box-sizing:border-box;line-height:1;';

            content.appendChild(img);
            content.appendChild(loadingBar);
            loader.appendChild(content);

            // Append to documentElement to avoid body overflow:hidden issues
            document.documentElement.appendChild(loader);

            // Set safe areas to black for mobile devices
            document.documentElement.style.background = '#000';
            document.body.style.background = '#000';
            const themeColor = document.querySelector('meta[name="theme-color"]');
            if (themeColor) {
                themeColor.setAttribute('content', '#000000');
            }

            // Animate loading bar
            const totalBlocks = 11;
            let currentBlock = 0;
            const intervalTime = 127;
            const interval = setInterval(() => {
                currentBlock++;
                loadingBar.textContent = '\u25AE'.repeat(currentBlock);
                if (currentBlock >= totalBlocks) {
                    clearInterval(interval);
                }
            }, intervalTime);

            setTimeout(() => {
                window.location.href = targetUrl;
            }, 2000);
        });
    }

    if (!nav || !logoFill) return;

    // Get background color at nav position
    function getBackgroundColor(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Get computed background color of body
        const body = document.body;
        const bgColor = window.getComputedStyle(body).backgroundColor;

        return bgColor;
    }

    // Parse RGB string to object
    function parseRGB(rgbString) {
        const match = rgbString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return { r: 0, g: 0, b: 0 };
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }

    // Calculate perceived brightness (0-255)
    function getBrightness(r, g, b) {
        // Using perceived brightness formula
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    // Calculate complementary color
    function getComplementaryColor(r, g, b) {
        // Convert RGB to HSL
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        // Rotate hue by 180 degrees for complementary
        h = (h + 0.5) % 1;

        // Increase saturation and lightness for visibility
        s = Math.min(1, s * 1.5 + 0.3);
        l = Math.max(0.5, Math.min(0.8, l + 0.3));

        // Convert back to RGB
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        let r2, g2, b2;
        if (s === 0) {
            r2 = g2 = b2 = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r2 = hue2rgb(p, q, h + 1/3);
            g2 = hue2rgb(p, q, h);
            b2 = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r2 * 255),
            g: Math.round(g2 * 255),
            b: Math.round(b2 * 255)
        };
    }

    // Update logo color based on background
    function updateLogoColor() {
        const bgColor = getBackgroundColor(nav);
        const rgb = parseRGB(bgColor);
        const brightness = getBrightness(rgb.r, rgb.g, rgb.b);

        // Threshold: if brightness is less than 40 (out of 255), it's "close to black"
        if (brightness < 40) {
            const complement = getComplementaryColor(rgb.r, rgb.g, rgb.b);
            logoFill.style.fill = `rgb(${complement.r}, ${complement.g}, ${complement.b})`;
            logoFill.classList.add('active');
        } else {
            logoFill.classList.remove('active');
        }
    }

    // Initial check
    updateLogoColor();

    // Check on scroll (for pages with scrolling content)
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateLogoColor();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Check on resize
    window.addEventListener('resize', updateLogoColor);

})();
