/**
 * Projects Build Script
 *
 * Single source of truth: data/projects.json
 *
 * Generates:
 *   1. js/projects-data.js  — window.PROJECTS_DATA for the homepage cards
 *                             (consumed by renderProjectCards() in js/main.js)
 *   2. Injects per-page <head> SEO meta into each projects/<slug>/index.html
 *      between  <!-- PROJECT-META:start --> ... <!-- PROJECT-META:end -->
 *   3. Injects series navigation + label into member pages between
 *      <!-- SERIES-NAV:start --> / <!-- SERIES-LABEL:start --> markers.
 *
 * Re-run after editing data/projects.json:  npm run build:projects
 * Generated regions are overwritten on every run — never hand-edit them.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data/projects.json');
const CARDS_OUT = path.join(ROOT, 'js/projects-data.js');

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];

// Escape a string for use inside an HTML attribute value.
function attr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Escape JSON for safe embedding inside a <script> tag.
function jsonForScript(obj) {
    return JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
}

// Replace the content between <!-- NAME:start ... --> and <!-- NAME:end --> markers.
function injectMarker(html, name, inner) {
    const re = new RegExp(
        `([ \\t]*)<!-- ${name}:start[^>]*-->[\\s\\S]*?<!-- ${name}:end -->`
    );
    if (!re.test(html)) return { html, found: false };
    const replaced = html.replace(re, (_m, indent) => {
        const body = inner
            .split('\n')
            .map((line) => (line ? indent + line : line))
            .join('\n');
        return `${indent}<!-- ${name}:start (GENERATED from data/projects.json — do not edit) -->\n${body}\n${indent}<!-- ${name}:end -->`;
    });
    return { html: replaced, found: true };
}

function main() {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const site = data.site;
    const projects = data.projects;
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

    generateCards(projects, site);

    projects.filter((p) => p.page).forEach((p) => injectPage(p, site, bySlug));
}

// ---------------------------------------------------------------------------
// 1. Homepage cards -> js/projects-data.js
// ---------------------------------------------------------------------------
function generateCards(projects, site) {
    const cards = projects
        .filter((p) => p.card)
        .map((p) => {
            const card = {
                id: p.slug,
                name: p.name,
                dataName: p.dataName || p.name,
                area: p.area,
                dataTech: p.dataTech,
                techDisplay: p.techDisplay || [],
                month: p.month,
                year: p.year,
                dateDisplay: p.dateDisplay,
                image: p.image || `projects/${p.slug}/preview.jpg`,
                imageAlt: p.imageAlt || p.name,
                description: p.description,
                techSectionLabel: p.techSectionLabel || 'Tools',
                href: p.href || `projects/${p.slug}/`
            };
            if (p.external) card.external = true;
            if (p.externalIcon) card.externalIcon = true;
            if (p.modal) card.modal = true;
            if (p.hidden) card.hidden = true;
            return card;
        });

    const banner =
        '/**\n' +
        ' * GENERATED FILE — do not edit.\n' +
        ' * Source of truth: data/projects.json   Regenerate: npm run build:projects\n' +
        ' *\n' +
        ' * window.PROJECTS_DATA drives the homepage project cards via\n' +
        ' * renderProjectCards() in js/main.js.\n' +
        ' */\n';

    const body =
        '(function () {\n' +
        '    "use strict";\n' +
        '    window.PROJECTS_DATA = ' +
        JSON.stringify(cards, null, 4).replace(/\n/g, '\n    ') +
        ';\n' +
        '})();\n';

    fs.writeFileSync(CARDS_OUT, banner + body, 'utf8');
    console.log(`✓ js/projects-data.js (${cards.length} cards)`);
}

// ---------------------------------------------------------------------------
// 2/3. Per-page <head> meta + series nav
// ---------------------------------------------------------------------------
function injectPage(p, site, bySlug) {
    const pagePath = path.join(ROOT, 'projects', p.slug, 'index.html');
    if (!fs.existsSync(pagePath)) {
        console.warn(`! skipped ${p.slug}: ${pagePath} not found`);
        return;
    }
    if (p.redirect) return; // redirect stubs need no meta

    let html = fs.readFileSync(pagePath, 'utf8');
    const meta = buildMeta(p, site, bySlug);

    let res = injectMarker(html, 'PROJECT-META', meta);
    if (!res.found) {
        console.warn(`! ${p.slug}: no PROJECT-META markers — meta not injected`);
    }
    html = res.html;

    // Series member pages also get generated nav + label.
    if (p.partOf) {
        const nav = buildSeriesNav(p, bySlug);
        html = injectMarker(html, 'SERIES-NAV', nav.nav).html;
        html = injectMarker(html, 'SERIES-LABEL', nav.label).html;
    }

    fs.writeFileSync(pagePath, html, 'utf8');
    console.log(`✓ projects/${p.slug}/index.html`);
}

function buildMeta(p, site, bySlug) {
    const seo = p.seo || {};
    const author = site.author;
    const url = `${site.domain}/projects/${p.slug}/`;
    let title, description, keywords, ogTitle, ogDescription, twTitle, twDescription, jsonLd;
    const jsonLdType = seo.jsonLdType || 'CreativeWork';

    if (p.partOf) {
        const series = bySlug[p.partOf];
        const seriesName = series.series.name;
        const members = series.series.members;
        const ord = ORDINALS[members.indexOf(p.slug)] || 'a';
        const medium = p.medium || 'Affinity Designer';
        title = seo.title || `${p.name} by ${author}`;
        description = seo.description || `${p.name} — digital art by ${author}. The ${ord} piece in the ${seriesName} series.`;
        keywords = seo.keywords || `${author}, digital art, ${p.name}, ${seriesName}, portrait, ${medium}`;
        ogTitle = seo.ogTitle || `${p.name} — ${seriesName} Series by ${author}`;
        ogDescription = seo.ogDescription || `The ${ord} piece in the ${seriesName} digital art series`;
        twTitle = seo.twitterTitle || `${p.name} — ${seriesName} Series`;
        twDescription = seo.twitterDescription || `Digital art piece by ${author}`;
        jsonLd = {
            '@context': 'https://schema.org',
            '@type': jsonLdType,
            name: p.name,
            creator: { '@type': 'Person', name: author },
            dateCreated: p.dateCreated || undefined,
            description: ogDescription,
            artMedium: 'Digital Art',
            isPartOf: { '@type': 'CreativeWorkSeries', name: seriesName }
        };
    } else {
        title = seo.title || `${p.name} by ${author}`;
        description = seo.description || p.description || '';
        keywords = seo.keywords || `${author}, ${p.name}`;
        ogTitle = seo.ogTitle || title;
        ogDescription = seo.ogDescription || description;
        twTitle = seo.twitterTitle || ogTitle;
        twDescription = seo.twitterDescription || ogDescription;
        jsonLd = {
            '@context': 'https://schema.org',
            '@type': jsonLdType,
            name: p.name,
            creator: { '@type': 'Person', name: author },
            description: ogDescription
        };
    }

    const ogImageRel = seo.ogImage || 'preview.jpg';
    const ogImage = /^https?:\/\//.test(ogImageRel) ? ogImageRel : `${url}${ogImageRel}`;
    const themeColor = seo.themeColor || '#0a0a0a';

    return [
        `<title>${attr(title)}</title>`,
        `<meta name="theme-color" content="${attr(themeColor)}">`,
        ``,
        `<!-- SEO -->`,
        `<meta name="description" content="${attr(description)}">`,
        `<meta name="keywords" content="${attr(keywords)}">`,
        `<meta name="author" content="${attr(author)}">`,
        `<meta name="robots" content="index, follow">`,
        `<link rel="canonical" href="${attr(url)}">`,
        ``,
        `<!-- Open Graph -->`,
        `<meta property="og:title" content="${attr(ogTitle)}">`,
        `<meta property="og:description" content="${attr(ogDescription)}">`,
        `<meta property="og:image" content="${attr(ogImage)}">`,
        `<meta property="og:url" content="${attr(url)}">`,
        `<meta property="og:type" content="website">`,
        `<meta property="og:site_name" content="${attr(site.siteName)}">`,
        ``,
        `<!-- Twitter -->`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${attr(twTitle)}">`,
        `<meta name="twitter:description" content="${attr(twDescription)}">`,
        `<meta name="twitter:image" content="${attr(ogImage)}">`,
        ``,
        `<!-- Structured Data -->`,
        `<script type="application/ld+json">`,
        jsonForScript(jsonLd),
        `</script>`
    ].join('\n');
}

function buildSeriesNav(p, bySlug) {
    const series = bySlug[p.partOf];
    const seriesName = series.series.name;
    const members = series.series.members;
    const n = members.length;
    const idx = members.indexOf(p.slug);
    const prev = bySlug[members[(idx - 1 + n) % n]];
    const next = bySlug[members[(idx + 1) % n]];

    const chevL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
    const chevR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
    const home = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';

    const nav = [
        `<a class="piece-nav-edge piece-nav-prev" href="../${prev.slug}/" aria-label="Previous piece: ${attr(prev.name)}">`,
        `    ${chevL}`,
        `</a>`,
        `<a class="piece-nav-edge piece-nav-next" href="../${next.slug}/" aria-label="Next piece: ${attr(next.name)}">`,
        `    ${chevR}`,
        `</a>`,
        `<a class="piece-nav-back" href="../${p.partOf}/" aria-label="Back to ${attr(seriesName)}">`,
        `    ${home}`,
        `    ${attr(seriesName)}`,
        `</a>`
    ].join('\n');

    const label = `<p class="artwork-series"><i>${attr(seriesName)}</i> Series</p>`;
    return { nav, label };
}

main();
