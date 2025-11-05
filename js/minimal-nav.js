/**
 * Minimal Nav - Dynamic Logo Color
 * Detects when nav is over dark backgrounds and applies complementary colors
 */

(function() {
    'use strict';

    const nav = document.querySelector('nav.minimal-nav');
    const logoFill = document.querySelector('.logo-fill');

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
