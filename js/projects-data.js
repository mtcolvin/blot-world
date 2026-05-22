/**
 * Project card data — source of truth for the homepage project cards.
 *
 * Edit this file to add, remove, or update a project. The card HTML on the
 * page is generated from this data at load time by renderProjectCards() in
 * main.js.
 *
 * Field reference:
 *   id              — unique slug for the card (used for hidden-card targeting)
 *   name            — display title shown on the card front and back
 *   dataName        — value for data-name attribute (used by filter/search)
 *   area            — project area (Web Design, Branding & Identity, etc.)
 *   dataTech        — comma-separated tech list for data-tech (filter)
 *   techDisplay     — array of strings shown as tags on the back of the card
 *   month / year    — for sorting / data-month / data-year attributes
 *   dateDisplay     — human-readable date range shown on front + back
 *   image           — preview image path
 *   imageAlt        — alt text for the image
 *   description     — short blurb shown on the back of the card
 *   techSectionLabel — header above the tech tags (e.g. "Tools", "Tech Stack")
 *   href            — anchor href (or '#' for modal-trigger cards)
 *   external        — true => opens link in new tab (target="_blank")
 *   externalIcon    — true => shows the external-link arrow icon next to the
 *                     title on the front (independent of `external`)
 *   modal           — true => clicking opens the BLOT.WORLD inception modal
 *                     (only used for the portfolio-website card)
 *   hidden          — true => starts hidden (e.g. easter-egg poetry card)
 */
(function () {
    "use strict";

    window.PROJECTS_DATA = [
        {
            id: 'blot-world',
            name: 'Blot.World Portfolio Website',
            dataName: 'BLOT.WORLD Portfolio Website',
            area: 'Web Design',
            dataTech: 'HTML,JavaScript,JSON,CSS,Python,Claude,ChatGPT,GitHub,GitHub Pages,Google Analytics,Google Tag Manager',
            techDisplay: ['HTML', 'CSS', 'JavaScript', 'JSON', 'Python', 'Claude', 'ChatGPT', 'GitHub', 'GitHub Pages', 'Google Analytics', 'Google Tag Manager'],
            month: 'September',
            year: '2025',
            dateDisplay: 'Sep 2025',
            image: 'images/previews/inception-protection.png',
            imageAlt: 'Portfolio Website',
            description: 'The site you’re looking at. Vanilla HTML, CSS, and JavaScript — no frameworks, custom build pipeline, deployed on GitHub Pages.',
            techSectionLabel: 'Tech Stack',
            href: '#',
            modal: true
        },
        {
            id: 'cafemex',
            name: 'Café Mexicali Rebrand',
            dataName: 'Cafe Mex Brand Redesign',
            area: 'Branding & Identity',
            dataTech: 'Affinity Designer',
            techDisplay: ['Affinity Designer'],
            month: 'September',
            year: '2025',
            dateDisplay: 'Sep 2025',
            image: 'images/previews/cafemex-preview.jpg',
            imageAlt: 'Cafe Mex Logo',
            description: 'Modernist refresh of a Mexican-Californian fusion restaurant. Identity system anchored on a single confident stroke.',
            techSectionLabel: 'Tools',
            href: 'projects/cafemex/cafemex.html'
        },
        {
            id: 'faces',
            name: 'Faces',
            dataName: 'Faces',
            area: 'Digital Art',
            dataTech: 'Affinity Designer',
            techDisplay: ['Affinity Designer'],
            month: 'August',
            year: '2023',
            dateDisplay: 'Aug 2023 — Oct 2025',
            image: 'images/previews/faces-preview.jpg',
            imageAlt: 'Faces Series',
            description: 'An evolving series of digital portraits exploring expression, identity, and the economy of line.',
            techSectionLabel: 'Tools',
            href: 'projects/faces/faces.html'
        },
        {
            id: 'retail-scheduling',
            name: 'Retail Scheduling Analysis',
            dataName: 'Retail Scheduling Analysis',
            area: 'Data Analysis',
            dataTech: 'Google Sheets',
            techDisplay: ['Google Sheets'],
            month: 'May',
            year: '2023',
            dateDisplay: 'May — Sep 2023',
            image: 'images/previews/dept-scheduling-analysis-preview.png',
            imageAlt: 'Walmart Online Pickup & Delivery Scheduling Analysis',
            description: 'Operational analysis of Walmart’s online pickup & delivery scheduling — surfacing inefficiencies and forecasting demand.',
            techSectionLabel: 'Tools',
            href: 'projects/retail-scheduling/redirect.html',
            external: true,
            externalIcon: true
        },
        {
            id: 'photography',
            name: 'Photography',
            dataName: 'Photography Gallery',
            area: 'Photography',
            dataTech: 'Lightroom',
            techDisplay: ['Lightroom'],
            month: 'August',
            year: '2017',
            dateDisplay: '2017 — Present',
            image: 'images/previews/photography-preview.jpg',
            imageAlt: 'Photography Gallery',
            description: 'A magazine-style chronological archive — months as viewport sections with photo-derived color halos and snap navigation.',
            techSectionLabel: 'Equipment & Stack',
            href: 'projects/photography/photography.html'
        },
        {
            id: 'poetry',
            name: 'Upon a Dove on the Railroad Track',
            dataName: 'Upon a Dove on the Railroad Track',
            area: 'Poetry',
            dataTech: 'English',
            techDisplay: ['English'],
            month: 'Present',
            year: '2015',
            dateDisplay: '2015 — Present',
            image: 'images/previews/poetry-preview.png',
            imageAlt: 'Poetry',
            description: 'An evolving poem of observation, life, and the small moments that endure.',
            techSectionLabel: 'Form',
            href: 'projects/poetry/poetry-showcase.html',
            external: true,
            hidden: true
        }
    ];
})();
