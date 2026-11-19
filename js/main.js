/* ==========================================================================
   BLOT.WORLD Portfolio - Main JavaScript
   ========================================================================== */

// ==========================================================================
// 0. AUDIO PRELOAD
// ==========================================================================

// Preload audio to eliminate first-click delay
const inceptionAudio = new Audio('sounds/windows-error.mp3');
inceptionAudio.volume = 0.5;
inceptionAudio.preload = 'auto';

// ==========================================================================
// 1. PAGE TRANSITION LOADER
// ==========================================================================

const PageLoader = {
	gifs: [
		'images/loaders/akuakua_a_far_away_total_solar_eclipse_in_a_sea_of_pure_black_cb4c7c01-ef1d-4139-b7a5-dc49cacefea2_1.gif',
		'images/loaders/akuakua_space-related_nes_aesthetic_8_bit_pixel_images_for_we_023141ec-734b-4726-b355-caa6f1f96e0f_1.gif',
		'images/loaders/akuakua_space-related_nes_aesthetic_8_bit_pixel_images_for_we_b62fe4d4-a1c4-440c-9f7b-252cb1c4d887_0.gif',
		'images/loaders/akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_6cda2543-228f-4ea4-842c-353a2b18a985_1.gif',
		'images/loaders/akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_95f256d7-d9da-4db1-b60e-6c7d95b316f8_1.gif',
		'images/loaders/akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_c0b67235-2101-4274-b854-9fa0f8f85d25_0.gif',
		'images/loaders/akuakua_space-related_nes_graphic_reminiscent_8_bit_pixel_ima_ed5c0816-dfd1-47aa-b5eb-1e7805171470_2.gif'
	],

	loadingInterval: null,

	getRandomGif() {
		return this.gifs[Math.floor(Math.random() * this.gifs.length)];
	},

	show() {
		const loader = document.getElementById('page-loader');
		const gif = document.getElementById('page-loader-gif');
		const loadingBar = document.getElementById('page-loader-bar');
		if (loader && gif) {
			gif.src = this.getRandomGif();
			loader.classList.add('active');
			// Animate loading bar with ▮ characters - fixed 11 blocks
			if (loadingBar) {
				// Clear any existing interval from previous navigation
				if (this.loadingInterval) {
					clearInterval(this.loadingInterval);
					this.loadingInterval = null;
				}

				const totalBlocks = 11;
				const intervalTime = 127;
				let currentBlock = 0;
				loadingBar.textContent = '';
				this.loadingInterval = setInterval(() => {
					currentBlock++;
					loadingBar.textContent = '▮'.repeat(currentBlock);
					if (currentBlock >= totalBlocks) {
						clearInterval(this.loadingInterval);
						this.loadingInterval = null;
					}
				}, intervalTime);
			}
		}
	},

	hide() {
		const loader = document.getElementById('page-loader');
		if (loader) {
			loader.classList.remove('active');
		}
		// Clear loading interval if still running
		if (this.loadingInterval) {
			clearInterval(this.loadingInterval);
			this.loadingInterval = null;
		}
		// Reset loading bar text
		const loadingBar = document.getElementById('page-loader-bar');
		if (loadingBar) {
			loadingBar.textContent = '';
		}
	},

	init() {
		// Reset loader state when page is restored from bfcache
		window.addEventListener('pageshow', (e) => {
			if (e.persisted) {
				// Page was restored from bfcache - reset loader state
				this.hide();
			}
		});

		// Show loader when clicking links that navigate away from index.html
		document.addEventListener('click', (e) => {
			const link = e.target.closest('a[href]');
			if (!link) return;

			const href = link.getAttribute('href');
			if (!href) return;

			// Skip hash-only links (like blot.world card that opens modal)
			if (href === '#' || href.startsWith('#')) return;

			// Check if it's a navigation to another page (not internal hash or section)
			const isExternalPage = href.endsWith('.html') && !href.includes('index.html');
			const isProjectLink = link.hasAttribute('data-project') || link.closest('[data-project]');

			if (isExternalPage || isProjectLink) {
				e.preventDefault();
				this.show();
				setTimeout(() => {
					window.location.href = href;
				}, 2000);
			}
		});
	}
};

// ==========================================================================
// 2. STATE MANAGEMENT
// ==========================================================================

const AppState = {
	activeFilters: {
		status: ['all'],
		domain: [],
		discipline: [],
		tech: [],
		madeWith: 'all',
		sort: 'date-desc'
	},

	currentSection: 'home',

	resetFilters() {
		this.activeFilters = {
			status: ['all'],
			domain: [],
			discipline: [],
			tech: [],
			madeWith: 'all',
			sort: 'date-desc'
		};
	}
};

// Tag substrings that flag a project as AI co-built. Match is case-insensitive
// and substring-based against dataTech, so "Claude Code" matches "claude".
const AI_TECH_TAGS = ['claude', 'chatgpt', 'grok', 'gemini', 'copilot'];

// Domain colors live in css/root.css as --domain-<lowercased name>.
function domainColorVar(domain) {
	const key = String(domain || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
	return key ? `var(--domain-${key}, var(--domain-fallback))` : 'var(--domain-fallback)';
}

function isAITech(techValue) {
	if (!techValue) return false;
	const haystack = techValue.toLowerCase();
	return AI_TECH_TAGS.some(needle => haystack.includes(needle));
}

// ==========================================================================
// 2. NAVIGATION & SECTION MANAGEMENT
// ==========================================================================

const Navigation = {
	init() {
		this.setupEventListeners();
		this.handleInitialLoad();
		this.setupBrowserNavigation();
	},
	
	setupEventListeners() {
		// All navigation links
		document.querySelectorAll('[data-section]').forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const sectionId = link.dataset.section;
				this.showSection(sectionId);
			});
		});

		// Event delegation for dynamically created blog cards
		document.addEventListener('click', (e) => {
			const blogCard = e.target.closest('[data-section]');
			if (blogCard && blogCard.classList.contains('blog-card')) {
				e.preventDefault();
				const sectionId = blogCard.dataset.section;
				this.showSection(sectionId);
			}
		});

		// Logo click
		document.querySelector('.logo')?.addEventListener('click', () => {
			this.showSection('home');
		});

		// Mobile menu
		document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
			this.toggleMobileMenu();
		});
	},
	
	showSection(sectionId) {
		const loader = document.getElementById('loader');
		document.body.classList.add('loading');
		loader?.classList.remove('hidden');
		
		// Scroll to top immediately when transitioning
		window.scrollTo({ top: 0, behavior: 'auto' }); // Changed to 'auto' for instant scroll
		
		setTimeout(() => {
			// Hide all sections
			document.querySelectorAll('.section').forEach(section => {
				section.classList.remove('active');
			});
			
			// Handle section-specific logic
			if (sectionId !== 'home') {
				ProjectsPreview.hide();
				window.removeEventListener('scroll', ProjectsPreview.handleScroll);
			}
			
			setTimeout(() => {
				const targetSection = document.getElementById(sectionId);
				if (targetSection) {
					targetSection.classList.add('active');
					AppState.currentSection = sectionId;
					// Save to localStorage for mininav redirect
					try {
						localStorage.setItem('blot-last-section', sectionId);
						// Save current filter params if on projects section
						if (sectionId === 'projects') {
							const filterParams = URLManager.serialize();
							localStorage.setItem('blot-last-filters', filterParams);
						}
					} catch (e) {}
				}

				// Update URL
				this.updateURL(sectionId);

				// Toggle mobile filter button visibility
				const mobileFilterBtn = document.getElementById('mobile-filter-nav-btn');
				if (mobileFilterBtn) {
					if (sectionId === 'projects') {
						mobileFilterBtn.classList.add('show-on-projects');
					} else {
						mobileFilterBtn.classList.remove('show-on-projects');
					}
				}

				// Section-specific initialization
				if (sectionId === 'home') {
					setTimeout(() => HeroAnimations.trigger(), 100);
					window.addEventListener('scroll', ProjectsPreview.handleScroll);
				} else if (sectionId === 'projects') {
					const urlFilters = URLManager.parseFilters();
					if (JSON.stringify(urlFilters) !== JSON.stringify(AppState.activeFilters)) {
						AppState.activeFilters = urlFilters;
						FilterSystem.applyFromState();
					}
				} else if (sectionId.startsWith('post-')) {
					// Load markdown content for blog posts
					MarkdownLoader.loadPost(sectionId);
				}
				
				this.updateNavState(sectionId);
				this.closeMobileMenu();
				
				window.scrollTo({ top: 0, behavior: 'smooth' });
				
				setTimeout(() => {
					loader?.classList.add('hidden');
					document.body.classList.remove('loading');
				}, 200);
			}, 100);
		}, 500);
	},
	
	updateURL(sectionId) {
		let newURL = window.location.pathname;

		if (sectionId === 'projects') {
			const filterParams = URLManager.serialize();
			if (filterParams) {
				newURL += `?${filterParams}`;
			}
			// Save filters to localStorage for mininav redirect
			try {
				localStorage.setItem('blot-last-filters', filterParams);
			} catch (e) {}
		}

		if (sectionId !== 'home') {
			newURL += `#${sectionId}`;
		}

		window.history.pushState(null, null, newURL);
	},
	
	updateNavState(sectionId) {
		document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
			if (link.dataset.section === sectionId) {
				link.classList.add('active');
			} else {
				link.classList.remove('active');
			}
		});
	},
	
	toggleMobileMenu() {
		const btn = document.getElementById('mobile-menu-btn');
		const nav = document.getElementById('mobile-nav');
		btn?.classList.toggle('active');
		nav?.classList.toggle('active');
	},
	
	closeMobileMenu() {
		const btn = document.getElementById('mobile-menu-btn');
		const nav = document.getElementById('mobile-nav');
		btn?.classList.remove('active');
		nav?.classList.remove('active');
	},
	
	handleInitialLoad() {
		const hash = window.location.hash.substring(1);
		const initialSection = (hash && document.getElementById(hash)) ? hash : 'home';
		
		if (initialSection === 'projects') {
			AppState.activeFilters = URLManager.parseFilters();
		}
		
		setTimeout(() => {
			document.getElementById('loader')?.classList.add('hidden');
			document.body.classList.remove('loading');

			document.querySelectorAll('.section').forEach(section => {
				section.classList.remove('active');
			});

			const targetSection = document.getElementById(initialSection);
			if (targetSection) {
				targetSection.classList.add('active');
				this.updateNavState(initialSection);

				// Toggle mobile filter button visibility on initial load
				const mobileFilterBtn = document.getElementById('mobile-filter-nav-btn');
				if (mobileFilterBtn) {
					if (initialSection === 'projects') {
						mobileFilterBtn.classList.add('show-on-projects');
					} else {
						mobileFilterBtn.classList.remove('show-on-projects');
					}
				}

				if (initialSection === 'projects') {
					setTimeout(() => FilterSystem.applyFromState(), 200);
				}

				if (initialSection === 'home') {
					setTimeout(() => HeroAnimations.trigger(), 200);
					window.addEventListener('scroll', ProjectsPreview.handleScroll);
				}
			}
		}, 500);
	},
	
	setupBrowserNavigation() {
		window.addEventListener('hashchange', () => {
			const hash = window.location.hash.substring(1);
			const sectionId = hash || 'home';
			
			if (document.getElementById(sectionId) && 
				!document.getElementById(sectionId).classList.contains('active')) {
				this.showSectionFromURL(sectionId);
			}
		});
	},
	
	showSectionFromURL(sectionId) {
		document.querySelectorAll('.section').forEach(section => {
			section.classList.remove('active');
		});
		
		if (sectionId !== 'home') {
			ProjectsPreview.hide();
			window.removeEventListener('scroll', ProjectsPreview.handleScroll);
		}
		
		const targetSection = document.getElementById(sectionId);
		if (targetSection) {
			setTimeout(() => targetSection.classList.add('active'), 50);
		}
		
		if (sectionId === 'projects') {
			const urlFilters = URLManager.parseFilters();
			AppState.activeFilters = urlFilters;
			setTimeout(() => {
				if (document.getElementById('projects').classList.contains('active')) {
					FilterSystem.applyFromState();
				}
			}, 100);
		}
		
		if (sectionId === 'home') {
			setTimeout(() => HeroAnimations.trigger(), 100);
			window.addEventListener('scroll', ProjectsPreview.handleScroll);
		} else if (sectionId.startsWith('post-')) {
			// Load markdown content for blog posts
			MarkdownLoader.loadPost(sectionId);
		}

		this.updateNavState(sectionId);
		this.closeMobileMenu();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
};

// ==========================================================================
// 3. HERO ANIMATIONS
// ==========================================================================

const HeroAnimations = {
	trigger() {
		// No animations needed for minimal hero
	},

	initRotatingTagline() {
		// No animations needed for minimal hero
	}
};

// ==========================================================================
// 4. PROJECTS PREVIEW
// ==========================================================================

const ProjectsPreview = {
	populate() {
		const previewGrid = document.getElementById('projects-preview-grid');
		const mainGrid = document.getElementById('projects-grid');

		if (!previewGrid || !mainGrid) return;

		previewGrid.innerHTML = '';

		const projectCardLinks = mainGrid.querySelectorAll('.project-card-link');
		const previewCount = Math.min(3, projectCardLinks.length);

		for (let i = 0; i < previewCount; i++) {
			const originalLink = projectCardLinks[i];
			const clonedLink = originalLink.cloneNode(true);

			// If this is the poetry card, remove ID from original to avoid duplicates
			if (originalLink.id === 'poetry-card') {
				originalLink.removeAttribute('id');
			}

			previewGrid.appendChild(clonedLink);
		}

		// Append series to titles
		if (typeof appendSeriesToTitles === 'function') {
			appendSeriesToTitles();
		}

		// Wrap and limit tags on mobile after populating
		if (typeof wrapTechTagsOnMobile === 'function') {
			setTimeout(() => {
				wrapTechTagsOnMobile();
				limitTagsOnMobile();
			}, 100);
		}
	},
	
	show() {
		const section = document.querySelector('.projects-preview-section');
		section?.classList.add('visible');
	},
	
	hide() {
		const section = document.querySelector('.projects-preview-section');
		section?.classList.remove('visible');
	},
	
	handleScroll() {
		if (!document.getElementById('home')?.classList.contains('active')) {
			return;
		}
		
		const scrollPosition = window.scrollY;
		const viewportHeight = window.innerHeight;
		const threshold = viewportHeight * 0.3;
		
		if (scrollPosition > threshold) {
			ProjectsPreview.show();
			window.removeEventListener('scroll', ProjectsPreview.handleScroll);
		}
	}
};

// ==========================================================================
// 4a. PROJECTS HEADER — line the "Projects" title up with the first card
// column and "Showing X of Y" with the last. The grid centers its auto-fill
// tracks inside .projects-main, so the cards sit inset from the header row
// by an amount that changes with the track count. Measure it and pad the
// header row to match.
// ==========================================================================

const ProjectsHeaderAlign = {
	init() {
		this.row = document.querySelector('#projects .projects-title-row');
		this.grid = document.getElementById('projects-grid');
		if (!this.row || !this.grid) return;
		const update = () => this.update();
		if ('ResizeObserver' in window) {
			new ResizeObserver(update).observe(this.grid);
		}
		window.addEventListener('resize', update);
		update();
	},

	update() {
		const { row, grid } = this;
		row.style.paddingLeft = '';
		row.style.paddingRight = '';
		row.classList.remove('header-wrap');
		const gridRect = grid.getBoundingClientRect();
		// Hidden section (display: none) — nothing to measure yet.
		if (!gridRect.width) return;

		const cs = getComputedStyle(grid);
		const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat).filter(n => !isNaN(n));
		if (!tracks.length) return;
		const gap = parseFloat(cs.columnGap) || 0;
		const used = tracks.reduce((a, b) => a + b, 0) + gap * (tracks.length - 1);
		const cardsLeft = gridRect.left + (gridRect.width - used) / 2;
		const cardsRight = cardsLeft + used;
		const rowRect = row.getBoundingClientRect();
		const wantLeft = Math.max(0, cardsLeft - rowRect.left);
		const wantRight = Math.max(0, rowRect.right - cardsRight);
		if (wantLeft <= 1 && wantRight <= 1) return;

		// With a single narrow column there may not be room for the title and
		// counter side by side between the card edges. Rather than squeeze
		// either onto two lines, let the counter wrap to its own line
		// (right-aligned under the title) and still align both to the cards.
		const rowStyle = getComputedStyle(row);
		const visibleKids = Array.from(row.children)
			.filter(el => getComputedStyle(el).display !== 'none');
		const stacked = rowStyle.flexDirection.startsWith('column');
		const rowGap = parseFloat(rowStyle.columnGap) || 0;
		const kidsWidth = stacked
			? Math.max(...visibleKids.map(el => el.scrollWidth))
			: visibleKids.reduce((sum, el) => sum + el.scrollWidth, 0)
				+ rowGap * Math.max(0, visibleKids.length - 1);
		let room = Math.max(0, row.clientWidth - kidsWidth);
		let padLeft, padRight;
		if (!stacked && room < wantLeft + wantRight) {
			row.classList.add('header-wrap');
			// Each line now only has to fit its widest item.
			room = Math.max(0, row.clientWidth - Math.max(...visibleKids.map(el => el.scrollWidth)));
			padLeft = Math.min(wantLeft, room);
			padRight = Math.min(wantRight, room - padLeft);
		} else {
			padLeft = Math.min(wantLeft, room);
			padRight = Math.min(wantRight, room - padLeft);
		}
		if (padLeft > 1) row.style.paddingLeft = `${Math.round(padLeft)}px`;
		if (padRight > 1) row.style.paddingRight = `${Math.round(padRight)}px`;
	}
};

// ==========================================================================
// 4b. FILTER SIDEBAR — pushes up off the bottom when the footer scrolls in
// so the fixed panel never overlaps the footer.
// ==========================================================================

const FilterSidebarSticky = {
	BASE_GAP: 16,
	init() {
		this.sidebar = document.getElementById('filter-sidebar');
		this.footer = document.querySelector('.global-footer');
		if (!this.sidebar || !this.footer) return;
		this.ticking = false;
		const onScroll = () => {
			if (this.ticking) return;
			this.ticking = true;
			requestAnimationFrame(() => this.update());
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		this.update();
	},
	update() {
		this.ticking = false;
		const footerTop = this.footer.getBoundingClientRect().top;
		const intrusion = window.innerHeight - footerTop;
		const bottom = Math.max(this.BASE_GAP, intrusion + this.BASE_GAP);
		document.documentElement.style.setProperty('--filter-sidebar-bottom', `${bottom}px`);
	}
};

// ==========================================================================
// 5. FILTER SYSTEM
// ==========================================================================

const FilterSystem = {
	init() {
		this.generateDynamicFilters();
		// Add delay before attaching listeners
		setTimeout(() => {
			this.attachEventListeners();
			this.attachMadeWithListeners();
			this.initCollapsibleSections();
		}, 200);
	},

	attachMadeWithListeners() {
		const buttons = document.querySelectorAll('.made-with-section .seg-btn');
		buttons.forEach(btn => {
			btn.addEventListener('click', () => {
				const value = btn.dataset.madeWith;
				AppState.activeFilters.madeWith = value;
				this.syncMadeWithUI();
				this.applyFilters();
			});
		});
	},

	syncMadeWithUI() {
		const value = AppState.activeFilters.madeWith || 'all';
		document.querySelectorAll('.made-with-section .seg-btn').forEach(btn => {
			const active = btn.dataset.madeWith === value;
			btn.classList.toggle('active', active);
			btn.setAttribute('aria-pressed', active ? 'true' : 'false');
		});
	},

	initCollapsibleSections() {
		const headers = document.querySelectorAll('.filter-section-header');
		headers.forEach(header => {
			header.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				const section = header.closest('.collapsible-section');
				const isCollapsed = section.classList.toggle('collapsed');
				// Update aria-expanded for accessibility
				header.setAttribute('aria-expanded', !isCollapsed);
			});
		});
	},
	
	generateDynamicFilters() {
		const projects = document.querySelectorAll('#projects-grid .project-card');
		const techCounts = new Map();
		// domain name -> { count, disciplines: Map(name -> count) }
		const domainMap = new Map();

		projects.forEach(project => {
			const domain = project.dataset.domain;
			if (domain) {
				if (!domainMap.has(domain)) domainMap.set(domain, { count: 0, disciplines: new Map() });
				const entry = domainMap.get(domain);
				entry.count++;
				const discipline = project.dataset.discipline;
				if (discipline) {
					entry.disciplines.set(discipline, (entry.disciplines.get(discipline) || 0) + 1);
				}
			}

			const techString = project.dataset.tech;
			if (techString) {
				const techs = techString.split(',').map(tech => tech.trim());
				techs.forEach(tech => {
					if (tech) {
						techCounts.set(tech, (techCounts.get(tech) || 0) + 1);
					}
				});
			}
		});
		
		this.domainData = Array.from(domainMap.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([name, entry]) => ({
				name,
				count: entry.count,
				disciplines: Array.from(entry.disciplines.entries())
					.sort((a, b) => a[0].localeCompare(b[0]))
					.map(([d, n]) => ({ name: d, count: n }))
			}));
		this.buildDomainTree();
		this.buildTechFilters(techCounts);
	},

	// ---- Domain tree (T2) -------------------------------------------------
	// A trunk with one branch per domain, each in its domain color, ending at
	// the domain's dot. Opening a domain lists its disciplines as indented
	// twigs off that dot. Disciplines are keyed "Domain/Discipline" so the same
	// discipline name under two domains stays distinct.
	openDomains: new Set(),
	domainData: [],

	disciplineKey(domain, discipline) {
		return `${domain}/${discipline}`;
	},

	isDomainLit(d) {
		const f = AppState.activeFilters;
		return f.domain.includes(d.name)
			|| d.disciplines.some(s => f.discipline.includes(this.disciplineKey(d.name, s.name)));
	},

	buildDomainTree() {
		const container = document.getElementById('domain-filter-options');
		if (!container) return;

		const f = AppState.activeFilters;
		const chevron = '<svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5l5 5-5 5"/></svg>';
		const rows = [];

		this.domainData.forEach((d, i) => {
			const next = this.domainData[i + 1];
			const on = f.domain.includes(d.name);
			const lit = this.isDomainLit(d);
			const partial = lit && !on;
			const open = this.openDomains.has(d.name) && d.disciplines.length > 0;
			const nextLit = next && this.isDomainLit(next);
			const vars = `--domain-color: ${domainColorVar(d.name)};${next ? ` --next-color: ${domainColorVar(next.name)};` : ''}`;
			const rowClass = ['domain-row', lit && 'is-lit', on && 'is-on', partial && 'is-partial', nextLit && 'next-lit', open && 'is-open']
				.filter(Boolean).join(' ');

			rows.push(
				`<div class="${rowClass}" style="${vars}">`
				+ '<svg class="tree-lines" width="40" height="30" viewBox="0 0 40 30" fill="none" aria-hidden="true">'
				+ (next ? '<path class="tree-next" d="M4 9V30"/>' : '')
				+ '<path class="tree-branch" d="M4 0V9Q4 15 10 15H17"/>'
				+ (open ? '<path class="tree-branch" d="M25 21V30"/>' : '')
				+ '</svg>'
				+ `<button type="button" class="domain-toggle" data-domain="${d.name}" aria-pressed="${on}">`
				+ '<span class="domain-dot" aria-hidden="true"></span>'
				+ `<span class="domain-label">${d.name}</span>`
				+ `<span class="filter-count">${d.count}</span>`
				+ '</button>'
				+ (d.disciplines.length
					? `<button type="button" class="domain-expand" data-domain="${d.name}" aria-expanded="${open}" aria-label="${open ? 'Hide' : 'Show'} ${d.name} disciplines">${chevron}</button>`
					: '<span class="domain-expand-spacer" aria-hidden="true"></span>')
				+ '</div>'
			);

			if (!open) return;
			d.disciplines.forEach((s, j) => {
				const key = this.disciplineKey(d.name, s.name);
				const sOn = on || f.discipline.includes(key);
				const last = j === d.disciplines.length - 1;
				const cls = ['discipline-row', sOn && 'is-lit', nextLit && 'next-lit'].filter(Boolean).join(' ');
				rows.push(
					`<div class="${cls}" style="${vars}">`
					+ '<svg class="tree-lines" width="40" height="26" viewBox="0 0 40 26" fill="none" aria-hidden="true">'
					+ (next ? '<path class="tree-next" d="M4 0V26"/>' : '')
					+ `<path class="tree-branch" d="M25 0V7Q25 13 31 13H36${last ? '' : 'M25 7V26'}"/>`
					+ '</svg>'
					+ `<button type="button" class="discipline-toggle" data-domain="${d.name}" data-discipline="${s.name}" aria-pressed="${sOn}">`
					+ `<span class="discipline-label">${s.name}</span>`
					+ `<span class="filter-count">${s.count}</span>`
					+ '</button>'
					+ '</div>'
				);
			});
		});

		container.innerHTML = rows.join('');

		if (!container.dataset.bound) {
			container.dataset.bound = 'true';
			container.addEventListener('click', (e) => this.handleDomainTreeClick(e));
		}
	},

	handleDomainTreeClick(e) {
		const f = AppState.activeFilters;
		const expand = e.target.closest('.domain-expand');
		const domainBtn = e.target.closest('.domain-toggle');
		const disciplineBtn = e.target.closest('.discipline-toggle');

		if (expand) {
			const name = expand.dataset.domain;
			if (this.openDomains.has(name)) this.openDomains.delete(name);
			else this.openDomains.add(name);
			this.buildDomainTree();
			return;
		}

		if (domainBtn) {
			const name = domainBtn.dataset.domain;
			// A domain covers all of its disciplines, so drop any individual picks.
			f.discipline = f.discipline.filter(k => !k.startsWith(`${name}/`));
			f.domain = f.domain.includes(name)
				? f.domain.filter(d => d !== name)
				: [...f.domain, name];
		} else if (disciplineBtn) {
			const domain = disciplineBtn.dataset.domain;
			const key = this.disciplineKey(domain, disciplineBtn.dataset.discipline);
			const d = this.domainData.find(x => x.name === domain);
			const allKeys = d ? d.disciplines.map(s => this.disciplineKey(domain, s.name)) : [key];

			if (f.domain.includes(domain)) {
				// Unpicking one discipline of a fully-selected domain: keep the rest.
				f.domain = f.domain.filter(x => x !== domain);
				f.discipline = [...f.discipline, ...allKeys.filter(k => k !== key)];
			} else if (f.discipline.includes(key)) {
				f.discipline = f.discipline.filter(k => k !== key);
			} else {
				f.discipline = [...f.discipline, key];
				// Every discipline picked = the whole domain.
				if (allKeys.every(k => f.discipline.includes(k))) {
					f.discipline = f.discipline.filter(k => !allKeys.includes(k));
					f.domain = [...f.domain, domain];
				}
			}
		} else {
			return;
		}

		this.buildDomainTree();
		this.applyFilters();
	},

	// Open any domain whose disciplines are individually selected (URL restore).
	openSelectedDomains() {
		AppState.activeFilters.discipline.forEach(k => {
			const domain = k.split('/')[0];
			if (domain) this.openDomains.add(domain);
		});
	},
	
	buildTechFilters(techCounts) {
		const container = document.getElementById('tech-filter-options');
		if (!container) return;
		
		container.innerHTML = '';
		
		const sortedTechs = Array.from(techCounts.entries())
			.sort((a, b) => a[0].localeCompare(b[0]));
		
		sortedTechs.forEach(([tech, count]) => {
			const option = this.createFilterOption('tech', tech, tech, count);
			container.appendChild(option);
		});
	},
	
	createFilterOption(filterType, value, label, count) {
		const optionDiv = document.createElement('div');
		optionDiv.className = 'filter-option';
		optionDiv.dataset.filter = filterType;
		optionDiv.dataset.value = value;
		
		const checkbox = document.createElement('div');
		checkbox.className = 'filter-checkbox';
		
		const labelSpan = document.createElement('span');
		labelSpan.textContent = label;
		
		const countSpan = document.createElement('span');
		countSpan.className = 'filter-count';
		countSpan.textContent = count;
		
		optionDiv.appendChild(checkbox);
		optionDiv.appendChild(labelSpan);
		optionDiv.appendChild(countSpan);
		
		return optionDiv;
	},
	
	attachEventListeners() {
		// Use a slight delay to ensure DOM is ready
		setTimeout(() => {
			const filterOptions = document.querySelectorAll('.filter-option');
			
			filterOptions.forEach(option => {
				// Remove old listener by cloning
				const newOption = option.cloneNode(true);
				option.parentNode.replaceChild(newOption, option);
				
				// Add fresh click listener
				newOption.addEventListener('click', (event) => {
					this.handleFilterClick(event);
				});
			});
		}, 100);
	},
	
	handleFilterClick(event) {
		const filterOption = event.currentTarget;
		const filterType = filterOption.dataset.filter;
		const filterValue = filterOption.dataset.value;
		const checkbox = filterOption.querySelector('.filter-checkbox');
		
		if (filterType === 'tech') {
			if (checkbox.classList.contains('checked')) {
				checkbox.classList.remove('checked');
				AppState.activeFilters.tech = AppState.activeFilters.tech
					.filter(tech => tech !== filterValue);
			} else {
				checkbox.classList.add('checked');
				AppState.activeFilters.tech.push(filterValue);
			}
		}
		
		this.applyFilters();
	},
	
	applyFilters() {
		const projectCards = document.querySelectorAll('#projects-grid .project-card-link');
		let visibleCount = 0;

		this.sortProjects(AppState.activeFilters.sort);

		const poetryCard = document.getElementById('poetry-card');
		const isPoetrVisible = poetryCard?.classList.contains('visible');

		const madeWith = AppState.activeFilters.madeWith || 'all';

		projectCards.forEach(card => {
			const projectCard = card.querySelector('.project-card');
			const domain = projectCard?.dataset.domain;
			const discipline = projectCard?.dataset.discipline;
			const tech = projectCard?.dataset.tech;
			const isAI = projectCard?.dataset.ai === 'true';

			// Domain and discipline picks are one OR group: a card matches if
			// its whole domain is selected or its own discipline is.
			const { domain: domainFilters, discipline: disciplineFilters } = AppState.activeFilters;
			const domainMatch = (domainFilters.length === 0 && disciplineFilters.length === 0)
				|| domainFilters.includes(domain)
				|| disciplineFilters.includes(this.disciplineKey(domain, discipline));

			const techMatch = AppState.activeFilters.tech.length === 0 ||
							AppState.activeFilters.tech.some(filterTech =>
								tech && tech.toLowerCase().includes(filterTech.toLowerCase())
							);

			const madeWithMatch = madeWith === 'all'
				|| (madeWith === 'ai' && isAI)
				|| (madeWith === 'solo' && !isAI);

			const allMatch = domainMatch && techMatch && madeWithMatch;

			// Poetry card visibility is controlled by background toggle AND filters
			if (card.id === 'poetry-card') {
				if (isPoetrVisible && allMatch) {
					card.classList.remove('hidden', 'fade-out');
					visibleCount++;
				} else if (isPoetrVisible) {
					// Poetry is enabled but doesn't match filters
					card.classList.add('fade-out');
					setTimeout(() => card.classList.add('hidden'), 300);
				}
				// If poetry is not visible, it stays hidden
				return;
			}

			if (allMatch) {
				card.classList.remove('hidden', 'fade-out');
				visibleCount++;
			} else {
				card.classList.add('fade-out');
				setTimeout(() => card.classList.add('hidden'), 300);
			}
		});

		// Calculate total excluding hidden poetry card
		const totalProjects = isPoetrVisible ? projectCards.length : projectCards.length - 1;
		this.updateCounter(visibleCount, totalProjects);
		
		setTimeout(() => {
			this.regenerateWithSelections();
		}, 350);
		
		if (document.getElementById('projects')?.classList.contains('active')) {
			Navigation.updateURL('projects');
		}
	},
	
	applyFromState() {
		document.getElementById('sort-select').value = AppState.activeFilters.sort;

		document.querySelectorAll('.filter-checkbox').forEach(cb => {
			cb.classList.remove('checked');
		});

		AppState.activeFilters.tech.forEach(tech => {
			const checkbox = document.querySelector(
				`[data-filter="tech"][data-value="${tech}"] .filter-checkbox`
			);
			if (checkbox) checkbox.classList.add('checked');
		});

		this.openSelectedDomains();
		this.buildDomainTree();
		this.syncMadeWithUI();
		this.applyFilters();
	},

	clearAll() {
		document.querySelectorAll('.filter-checkbox').forEach(cb => {
			cb.classList.remove('checked');
		});

		document.getElementById('sort-select').value = 'date-desc';

		AppState.resetFilters();
		this.buildDomainTree();
		this.syncMadeWithUI();
		this.applyFilters();
	},
	
	sortProjects(sortBy) {
		const grid = document.getElementById('projects-grid');
		const cards = Array.from(grid.children);

		// Helper function to convert month name to number
		const monthToNumber = (month) => {
			if (month === 'Present') return 13; // Treat "Present" as later than December
			const months = {
				'January': 1, 'February': 2, 'March': 3, 'April': 4,
				'May': 5, 'June': 6, 'July': 7, 'August': 8,
				'September': 9, 'October': 10, 'November': 11, 'December': 12
			};
			return months[month] || 0;
		};

		// Helper function to get date value for comparison
		const getDateValue = (card) => {
			const year = parseInt(card.dataset.year) || 0;
			const month = monthToNumber(card.dataset.month || '');
			// Create a comparable number: year * 100 + month
			return year * 100 + month;
		};

		cards.sort((a, b) => {
			const aCard = a.querySelector('.project-card');
			const bCard = b.querySelector('.project-card');

			switch(sortBy) {
				case 'date-desc': // Newest first
					return getDateValue(bCard) - getDateValue(aCard);
				case 'date-asc': // Oldest first
					return getDateValue(aCard) - getDateValue(bCard);
				case 'name-asc':
					return aCard.dataset.name.localeCompare(bCard.dataset.name);
				case 'name-desc':
					return bCard.dataset.name.localeCompare(aCard.dataset.name);
				default:
					return 0;
			}
		});

		cards.forEach(card => grid.appendChild(card));
	},
	
	updateCounter(visible, total) {
		const visibleEl = document.getElementById('visible-count');
		const totalEl = document.getElementById('total-count');
		const visibleMobileEl = document.getElementById('visible-count-mobile');
		const totalMobileEl = document.getElementById('total-count-mobile');
		const visibleDesktopEl = document.getElementById('visible-count-desktop');
		const totalDesktopEl = document.getElementById('total-count-desktop');

		if (visibleEl) visibleEl.textContent = visible;
		if (totalEl) totalEl.textContent = total;
		if (visibleMobileEl) visibleMobileEl.textContent = visible;
		if (totalMobileEl) totalMobileEl.textContent = total;
		if (visibleDesktopEl) visibleDesktopEl.textContent = visible;
		if (totalDesktopEl) totalDesktopEl.textContent = total;
	},
	
	regenerateWithSelections() {
		const currentSelections = {
			tech: [...AppState.activeFilters.tech]
		};

		// The domain tree renders straight from AppState, so it survives the
		// rebuild without any restore step.
		this.generateDynamicFilters();

		AppState.activeFilters.tech = currentSelections.tech;
		
		this.restoreSelections();
		
		// RE-ATTACH LISTENERS after regeneration
		setTimeout(() => {
			this.attachEventListeners();
		}, 100);
	},
	
	restoreSelections() {
		document.querySelectorAll('.filter-checkbox').forEach(cb => {
			cb.classList.remove('checked');
		});

		AppState.activeFilters.tech.forEach(tech => {
			const checkbox = document.querySelector(
				`[data-filter="tech"][data-value="${tech}"] .filter-checkbox`
			);
			if (checkbox) checkbox.classList.add('checked');
		});
	}
};

// ==========================================================================
// 6. URL MANAGER
// ==========================================================================

const URLManager = {
	serialize() {
		const params = new URLSearchParams();

		if (AppState.activeFilters.domain.length > 0) {
			params.set('domain', AppState.activeFilters.domain.join(','));
		}

		if (AppState.activeFilters.discipline.length > 0) {
			params.set('discipline', AppState.activeFilters.discipline.join(','));
		}

		if (AppState.activeFilters.tech.length > 0) {
			params.set('tech', AppState.activeFilters.tech.join(','));
		}

		if (AppState.activeFilters.madeWith && AppState.activeFilters.madeWith !== 'all') {
			params.set('made-with', AppState.activeFilters.madeWith);
		}

		if (AppState.activeFilters.sort !== 'date-desc') {
			params.set('sort', AppState.activeFilters.sort);
		}

		return params.toString();
	},

	parseFilters() {
		const urlParams = new URLSearchParams(window.location.search);

		const filters = {
			status: ['all'],
			domain: [],
			discipline: [],
			tech: [],
			madeWith: 'all',
			sort: 'date-desc'
		};

		if (urlParams.has('domain')) {
			filters.domain = urlParams.get('domain').split(',').filter(Boolean);
		}

		if (urlParams.has('discipline')) {
			filters.discipline = urlParams.get('discipline').split(',').filter(k => k.includes('/'));
		}

		if (urlParams.has('tech')) {
			filters.tech = urlParams.get('tech').split(',');
		}

		if (urlParams.has('made-with')) {
			const v = urlParams.get('made-with');
			if (v === 'solo' || v === 'ai' || v === 'all') filters.madeWith = v;
		}

		if (urlParams.has('sort')) {
			filters.sort = urlParams.get('sort');
		}

		return filters;
	}
};

// ==========================================================================
// 7. GLOBAL EVENT HANDLERS
// ==========================================================================

function handleSortChange(selectElement) {
	AppState.activeFilters.sort = selectElement.value;
	FilterSystem.applyFilters();
}

function clearAllFilters() {
	FilterSystem.clearAll();
}

function showSection(sectionId) {
	Navigation.showSection(sectionId);
}

// ==========================================================================
// 8. INITIALIZATION
// ==========================================================================

// Build a responsive <picture> that serves AVIF → WebP → original (jpg/png),
// choosing among width variants (480/960) generated by scripts/build-srcset.js.
// The build guard (npm run check:pictures) ensures every variant exists, so the
// <source> tags never point at a missing file. `imgAttrs` is the raw attribute
// string for the fallback <img> (must include the alt text).
function pictureFor(src, imgAttrs) {
	const stem = src.replace(/\.(jpe?g|png)$/i, '');
	const set = (ext) => [480, 960].map(w => `${stem}-${w}.${ext} ${w}w`).join(', ');
	const sizes = '(max-width: 640px) 45vw, 260px';
	return `<picture>`
		+ `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">`
		+ `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">`
		+ `<img src="${src}" ${imgAttrs}>`
		+ `</picture>`;
}

// Render project cards from window.PROJECTS_DATA into #projects-grid.
// Runs BEFORE filter/preview init so downstream code sees the populated DOM.
function renderProjectCards(isTouchDevice) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const projects = window.PROJECTS_DATA || [];

    // Desktop hovers to flip; touch taps to expand — reflect that in the hint.
    const hintLabel = isTouchDevice ? 'More info' : 'Flip';
    const flipArrow = isTouchDevice
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
    const viewArrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
    const externalIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11" fill="currentColor" style="margin-left:4px;vertical-align:baseline;flex-shrink:0;"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3z"/><path d="M5 5h5V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5h-2v5H5V5z"/></svg>';

    const html = projects.map(p => {
        const linkAttrs = [
            `href="${p.href}"`,
            'class="project-card-link"',
            'data-project="true"',
            p.hidden ? `id="${p.id}-card"` : '',
            p.external ? 'target="_blank" rel="noopener noreferrer"' : '',
            p.modal ? 'onclick="event.preventDefault(); showInceptionModal();"' : ''
        ].filter(Boolean).join(' ');

        // AI-co-built treatment: sort AI-related tags to the front, tag them
        // with .is-ai for the violet styling, and surface a "CO-BUILT" badge on
        // the front when any AI tool is in the stack.
        const orderedTags = [...(p.techDisplay || [])].sort((a, b) => {
            const aAI = isAITech(a) ? 0 : 1;
            const bAI = isAITech(b) ? 0 : 1;
            return aAI - bAI;
        });
        const tags = orderedTags
            .map(t => `<span class="back-tag${isAITech(t) ? ' is-ai' : ''}">${t}</span>`)
            .join('');
        const isAI = isAITech(p.dataTech);
        // AI pill: same form factor as the domain tag; the holo gradient
        // lives on the sparkle and the "AI" label, not on an edge.
        const aiBadge = isAI
            ? '<div class="ai-badge" role="img" aria-label="Co-built with AI" title="Co-built with AI"><span class="ai-spark" aria-hidden="true"></span><span class="ai-holo-text" aria-hidden="true">AI</span></div>'
            : '';
        const domainVar = domainColorVar(p.domain);
        const domainTag = p.domain
            ? `<div class="domain-tag" style="--domain-color: ${domainVar}">`
                + '<span class="domain-tag-dot" aria-hidden="true"></span>'
                + `<span class="domain-tag-name">${p.domain}</span>`
                + (p.discipline ? `<span class="domain-tag-sep" aria-hidden="true">/</span><span class="domain-tag-discipline">${p.discipline}</span>` : '')
                + '</div>'
            : '';
        const backDomain = [p.domain, p.discipline].filter(Boolean).join(' / ');
        const cardClass = isAI ? 'project-card ai-project' : 'project-card';
        const extIcon = p.externalIcon ? externalIcon : '';

        return `
            <a ${linkAttrs}>
                <div class="${cardClass}"
                    data-domain="${p.domain || ''}"
                    data-discipline="${p.discipline || ''}"
                    data-tech="${p.dataTech}"
                    data-name="${p.dataName}"
                    data-month="${p.month}"
                    data-year="${p.year}"
                    data-ai="${isAI}">
                    <div class="card-face card-front">
                        <div class="card-image">${pictureFor(p.image, `alt="${p.imageAlt || p.name}"`)}</div>
                        <div class="corner-chips">
                            ${domainTag}
                        </div>
                        ${aiBadge}
                        <div class="body">
                            <div class="card-name">${p.name}${extIcon}</div>
                            <div class="meta">
                                <span>${p.dateDisplay}</span>
                                <span class="flip-hint">${hintLabel} ${flipArrow}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-face card-back">
                        <div class="back-scroll">
                            <div class="back-area" style="--domain-color: ${domainVar}"><span class="dot"></span>${backDomain}</div>
                            <div class="back-name">${p.name}</div>
                            <div class="back-divider"></div>
                            <div class="back-desc">${p.description}</div>
                            <div class="back-tags">${tags}</div>
                        </div>
                        <div class="back-footer">
                            <span>${p.dateDisplay}</span>
                            <span class="view-cta">View ${viewArrow}</span>
                        </div>
                    </div>
                </div>
            </a>`;
    }).join('');

    grid.innerHTML = html;
}

// ==========================================================================
// FILTER ICON MORPH
// The mobile filter button's icon (three narrowing lines) morphs into a
// right-pointing close arrow while the full-screen filter panel is open, and
// back when it closes. Every stroke is a loop of N points, so a line can turn
// into an arrow arm by plain point interpolation (works in every browser,
// unlike animating the SVG `d` property). The top and bottom lines become the
// arms; the middle one shrinks into the tip.
// ==========================================================================
const FilterIconMorph = {
    N: 64,

    // A polyline drawn out-and-back as a closed loop, resampled to N points.
    strokeLoop(pts) {
        const half = this.N / 2, seg = [];
        let total = 0;
        for (let i = 1; i < pts.length; i++) {
            const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
            seg.push(d);
            total += d;
        }
        const out = [];
        for (let k = 0; k < half; k++) {
            let dist = (k / (half - 1)) * total, i = 0;
            while (i < seg.length - 1 && dist > seg[i]) { dist -= seg[i]; i++; }
            const t = seg[i] ? Math.min(dist / seg[i], 1) : 0;
            out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
        }
        return out.concat(out.slice().reverse());
    },

    init(button, sidebar) {
        const NS = 'http://www.w3.org/2000/svg';
        const tip = [15, 12];
        const point = Array.from({ length: this.N }, () => tip.slice());
        const shapes = [
            { from: this.strokeLoop([[5, 7], [19, 7]]), to: this.strokeLoop([[10, 7], tip]), sw: [2, 2.5] },
            { from: this.strokeLoop([[11, 17], [13, 17]]), to: this.strokeLoop([[10, 17], tip]), sw: [2, 2.5] },
            { from: this.strokeLoop([[8, 12], [16, 12]]), to: point, sw: [2, 0], fade: true },
        ];

        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '36');
        svg.setAttribute('height', '36');
        svg.setAttribute('aria-hidden', 'true');
        const rect = document.createElementNS(NS, 'rect');
        [['x', 2], ['y', 2], ['width', 20], ['height', 20], ['rx', 4], ['fill', 'black']]
            .forEach(([k, v]) => rect.setAttribute(k, v));
        svg.appendChild(rect);
        const paths = shapes.map(() => {
            const p = document.createElementNS(NS, 'path');
            p.setAttribute('fill', 'none');
            p.setAttribute('stroke', 'white');
            p.setAttribute('stroke-linecap', 'round');
            p.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(p);
            return p;
        });

        const render = t => {
            shapes.forEach((s, i) => {
                const d = s.from.map((a, k) => {
                    const b = s.to[k];
                    return (a[0] + (b[0] - a[0]) * t).toFixed(2) + ' ' + (a[1] + (b[1] - a[1]) * t).toFixed(2);
                });
                paths[i].setAttribute('d', 'M' + d.join('L') + 'Z');
                paths[i].setAttribute('stroke-width', s.sw[0] + (s.sw[1] - s.sw[0]) * t);
                if (s.fade) paths[i].setAttribute('opacity', Math.max(0, 1 - t * 1.4));
            });
        };

        const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let current = 0, raf = 0;
        const morphTo = target => {
            cancelAnimationFrame(raf);
            if (reduceMotion.matches) { current = target; render(current); return; }
            const start = current, t0 = performance.now(), dur = 400;
            const step = now => {
                const k = Math.min((now - t0) / dur, 1);
                current = start + (target - start) * ease(k);
                render(current);
                if (k < 1) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        };

        render(0);
        button.replaceChildren(svg);

        // Follow the panel's state however it opens or closes (button, Escape,
        // swipe, overlay), rather than hooking each of those separately.
        new MutationObserver(() => {
            const open = sidebar.classList.contains('active');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.setAttribute('aria-label', open ? 'Close filters' : 'Open filters');
            morphTo(open ? 1 : 0);
        }).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    },
};

// ==========================================================================
// MADE-WITH TRAY
// Two background fills behind the segmented control's labels, no outlines:
// a solid fill on the selected option (follows the .active class FilterSystem
// sets) and a fainter fill that follows hover/focus. The hover fill hides
// when it would sit on the selected option, and slides back on leave.
// ==========================================================================
const MadeWithTray = {
    init() {
        document.querySelectorAll('.made-with-section .filter-segmented').forEach(tray => {
            const buttons = [...tray.querySelectorAll('.seg-btn')];
            if (!buttons.length) return;
            const thumb = document.createElement('div');
            const hoverFill = document.createElement('div');
            thumb.className = 'seg-thumb';
            hoverFill.className = 'seg-hover';
            thumb.setAttribute('aria-hidden', 'true');
            hoverFill.setAttribute('aria-hidden', 'true');
            tray.prepend(hoverFill);
            tray.prepend(thumb);
            tray.classList.add('has-indicators');

            const active = () => buttons.find(b => b.classList.contains('active')) || buttons[0];
            let hovered = null;
            const place = (el, btn) => {
                el.style.width = btn.offsetWidth + 'px';
                el.style.transform = `translateX(${btn.offsetLeft}px)`;
                el.classList.toggle('ai', btn.dataset.madeWith === 'ai');
            };
            const sync = () => {
                const current = active();
                place(thumb, current);
                place(hoverFill, hovered || current);
                hoverFill.classList.toggle('is-visible', !!hovered && hovered !== current);
                buttons.forEach(b => b.classList.toggle('is-hover', b === hovered));
            };
            // Snap into place with no slide (first layout, panel shown, resize).
            const snap = () => {
                thumb.style.transition = hoverFill.style.transition = 'none';
                sync();
                void tray.offsetWidth;
                thumb.style.transition = hoverFill.style.transition = '';
            };

            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', () => { hovered = btn; sync(); });
                btn.addEventListener('focus', () => { hovered = btn; sync(); });
                btn.addEventListener('blur', () => { hovered = null; sync(); });
            });
            tray.addEventListener('mouseleave', () => { hovered = null; sync(); });

            // Selection changes come from FilterSystem (click, URL state, reset).
            // Watch only aria-pressed, which FilterSystem sets alongside .active
            // and which this code never touches, so sync() can't retrigger itself.
            const selectionObserver = new MutationObserver(sync);
            buttons.forEach(b => selectionObserver.observe(b, { attributes: true, attributeFilter: ['aria-pressed'] }));
            // The tray has no size while its panel is hidden; re-snap when it gets one.
            new ResizeObserver(snap).observe(tray);
            snap();
        });
    },
};

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loading');

    // Touch-only detection — must run BEFORE renderProjectCards so the card
    // template can pick the right hint label ("More info" vs "Flip").
    // Two cases qualify as touch-only:
    //   1) Primary input is coarse + no hover → phones, Android tablets.
    //   2) iPad: reports hover:hover (lies), but no real Mac has a touchscreen,
    //      so MacIntel + maxTouchPoints > 1 is unambiguously an iPad.
    const isCoarseNoHover = matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const isTouchDevice = isCoarseNoHover || isIPad;
    if (isTouchDevice) {
        document.documentElement.classList.add('touch-device');
    }

    renderProjectCards(isTouchDevice);

    PageLoader.init();
    Navigation.init();
    HeroAnimations.initRotatingTagline();
    FilterSystem.init();
    FilterSidebarSticky.init();
    ProjectsHeaderAlign.init();
    ProjectsPreview.populate();
    populateAreaBadges();
    initializeBlog();
    QuoteRotator.init();
    SayingRotator.init();
    NameTyper.init();
    checkTagsOverflow();

    // Initialize project counter (excluding hidden poetry card)
    const updateProjectCounter = () => {
        const allProjects = document.querySelectorAll('#projects-grid .project-card');
        const poetryCard = document.getElementById('poetry-card');
        const isPoetrVisible = poetryCard?.classList.contains('visible');
        const totalProjects = isPoetrVisible ? allProjects.length : allProjects.length - 1;

        // Count visible projects (not filtered out)
        const visibleProjects = Array.from(allProjects).filter(card => {
            const link = card.closest('.project-card-link');
            return !card.classList.contains('hidden') &&
                   (link?.id !== 'poetry-card' || isPoetrVisible);
        }).length;

        FilterSystem.updateCounter(visibleProjects, totalProjects);
    };

    updateProjectCounter();

    // Touch-device project cards: tap to expand, tap again to navigate, tap outside to collapse.
    // (isTouchDevice was computed at the top of DOMContentLoaded above.)
    if (isTouchDevice) {
        const setBodyFlipState = () => {
            const anyFlipped = !!document.querySelector('.project-card-link.flipped');
            document.body.classList.toggle('has-flipped-card', anyFlipped);
        };

        // Strip href + onclick from project-card-links and stash them in
        // data-*. This is the most reliable way to suppress first-tap
        // navigation on mobile — preventDefault on click/touchend is
        // unreliable on iOS. We re-implement navigation in JS on the second
        // tap. Also strips the inception modal onclick so the BLOT.WORLD
        // card behaves like a normal card on touch (slide-out, no modal).
        function neutralizeCardLinks() {
            document.querySelectorAll('.project-card-link').forEach(link => {
                if (link.dataset.touchHrefDone) return;
                if (link.hasAttribute('onclick')) {
                    link.removeAttribute('onclick');
                }
                const href = link.getAttribute('href');
                if (href) {
                    link.dataset.touchHref = href;
                    link.dataset.touchTarget = link.getAttribute('target') || '';
                    link.removeAttribute('href');  // no navigation on click
                    link.style.cursor = 'pointer';
                }
                link.dataset.touchHrefDone = '1';
            });
        }
        neutralizeCardLinks();
        // Re-run if cards get added later (preview clones, filter re-renders).
        new MutationObserver(neutralizeCardLinks).observe(document.body, {
            childList: true, subtree: true
        });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('.project-card-link');
            const allLinks = document.querySelectorAll('.project-card-link');
            if (!link) {
                // Tap outside any card → collapse all.
                allLinks.forEach(l => l.classList.remove('flipped'));
                setBodyFlipState();
                return;
            }
            // Navigate ONLY when tapping the back's view CTA on a flipped card.
            // Skip navigation for hash-only hrefs (e.g., the inception card has
            // href="#") so the View button stays inert rather than scrolling.
            if (link.classList.contains('flipped') && e.target.closest('.view-cta')) {
                const href = link.dataset.touchHref;
                if (!href || href === '#') return;
                if (link.dataset.touchTarget === '_blank') {
                    window.open(href, '_blank', 'noopener,noreferrer');
                } else {
                    window.location.href = href;
                }
                return;
            }

            if (!link.classList.contains('flipped')) {
                // First tap on a card → slide out the back.
                allLinks.forEach(l => { if (l !== link) l.classList.remove('flipped'); });
                link.classList.add('flipped');
                setBodyFlipState();
            } else {
                // Tap anywhere on a flipped card (not the view CTA) → collapse it.
                link.classList.remove('flipped');
                setBodyFlipState();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Navigation.closeMobileMenu();
            // Also close filter sidebar on Escape
            const filterSidebar = document.getElementById('filter-sidebar');
            const filterOverlay = document.getElementById('filter-overlay');
            if (filterSidebar && filterOverlay) {
                filterSidebar.classList.remove('active');
                filterOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Filter toggle functionality for mobile
    const filterToggleBtn = document.getElementById('filter-toggle-btn');
    const mobileFilterNavBtn = document.getElementById('mobile-filter-nav-btn');
    const filterCloseBtn = document.getElementById('filter-close-btn');
    const filterSidebar = document.getElementById('filter-sidebar');
    const filterOverlay = document.getElementById('filter-overlay');

    if (mobileFilterNavBtn && filterSidebar) FilterIconMorph.init(mobileFilterNavBtn, filterSidebar);
    MadeWithTray.init();

    const toggleFilterSidebar = () => {
        filterSidebar.classList.toggle('active');
        filterOverlay.classList.toggle('active');

        // Lock/unlock scrolling
        if (filterSidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    if (filterToggleBtn && filterSidebar && filterOverlay) {
        // Toggle filter sidebar from projects page button
        filterToggleBtn.addEventListener('click', toggleFilterSidebar);
    }

    if (mobileFilterNavBtn && filterSidebar && filterOverlay) {
        // Toggle filter sidebar from mobile navbar button
        mobileFilterNavBtn.addEventListener('click', toggleFilterSidebar);
    }

    if (filterSidebar && filterOverlay) {
        // Close filter sidebar when clicking close button
        if (filterCloseBtn) {
            filterCloseBtn.addEventListener('click', () => {
                filterSidebar.classList.remove('active');
                filterOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close filter sidebar when clicking overlay
        filterOverlay.addEventListener('click', () => {
            filterSidebar.classList.remove('active');
            filterOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Touch swipe-right to dismiss (sidebar slides in from the right).
        let fsStartX = 0, fsStartY = 0;
        filterSidebar.addEventListener('touchstart', e => {
            fsStartX = e.touches[0].clientX;
            fsStartY = e.touches[0].clientY;
        }, { passive: true });
        filterSidebar.addEventListener('touchend', e => {
            if (!filterSidebar.classList.contains('active')) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - fsStartX;
            const dy = t.clientY - fsStartY;
            if (dx > 80 && Math.abs(dy) < 60) {
                filterSidebar.classList.remove('active');
                filterOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, { passive: true });
    }

    NightSky.init();

    // Secret poetry card is shown only in stars (night-sky) mode.
    const syncBackgroundAndPoetry = (showStars) => {
        const poetryCard = document.getElementById('poetry-card');
        if (!poetryCard) return;
        poetryCard.classList.toggle('visible', showStars);
        updateProjectCounter();
    };

    const bgToggleBtn = document.getElementById('bg-toggle-btn');
    if (bgToggleBtn) {
        bgToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            NightSky.toggle();
            // Stars mode is active when the night sky is on.
            syncBackgroundAndPoetry(NightSky.isActive);
        });
    }

    // Restore poetry card state on page load (grid by default → hidden).
    syncBackgroundAndPoetry(localStorage.getItem('backgroundMode') === 'night-sky');
});


// ==========================================================================
// 10. INCEPTION PROTECTION
// ==========================================================================

function showInceptionModal() {
	const modal = document.getElementById('inception-modal');
	if (modal) {
		modal.classList.add('active');
		document.body.classList.add('no-scroll');
		
		// Play preloaded Windows error sound
		inceptionAudio.currentTime = 0; // Reset to start in case it was played before
		inceptionAudio.play().catch(err => {
			console.log('Audio playback failed:', err);
		});
	}
}

function closeInceptionModal() {
	const modal = document.getElementById('inception-modal');
	if (modal) {
		modal.classList.remove('active');
		document.body.classList.remove('no-scroll');
	}
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		closeInceptionModal();
	}
});

// Close modal if clicking outside
document.getElementById('inception-modal')?.addEventListener('click', (e) => {
	if (e.target.id === 'inception-modal') {
		closeInceptionModal();
	}
});

// ==========================================================================
// 11. NIGHT SKY BACKGROUND
// ==========================================================================

const NightSky = {
	canvas: null,
	ctx: null,
	stars: [],
	shootingStars: [],
	animationFrame: null,
	isActive: false,
	resizeTimeout: null,

	init() {
		this.canvas = document.getElementById('night-sky-canvas');
		if (!this.canvas) return;

		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();
		this.createStars();

		// Only resize stars on desktop (not on mobile to prevent regeneration while scrolling)
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

		if (!isMobile) {
			window.addEventListener('resize', () => {
				clearTimeout(this.resizeTimeout);
				this.resizeTimeout = setTimeout(() => this.resizeCanvas(), 250);
			});
		}

		// Apply saved background mode (default to grid unless explicitly night-sky)
		const savedMode = localStorage.getItem('backgroundMode');

		const applyMode = () => {
			const background = document.getElementById('global-background');
			if (savedMode === 'night-sky') {
				// Stars mode is only entered via the eclipse/background toggle.
				this.isActive = true;
				background?.classList.add('night-sky-mode');
				if (!this.animationFrame) {
					this.animate();
				}
			} else {
				// Default to grid — includes 'grid', null, undefined.
				this.isActive = false;
				background?.classList.remove('night-sky-mode');
				if (this.animationFrame) {
					cancelAnimationFrame(this.animationFrame);
					this.animationFrame = null;
				}
				if (this.ctx && this.canvas) {
					this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				}
			}
		};

		// Apply immediately
		applyMode();

		// Re-apply after a delay to catch any interference
		setTimeout(applyMode, 50);
		setTimeout(applyMode, 200);
	},
	
	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		
		if (this.isActive) {
			this.createStars();
		}
	},
	
	createStars() {
		this.stars = [];
		const starCount = Math.floor((this.canvas.width * this.canvas.height) / 8000); // More spaced out (was 3000)
		
		for (let i = 0; i < starCount; i++) {
			this.stars.push({
				x: Math.random() * this.canvas.width,
				y: Math.random() * this.canvas.height,
				radius: Math.random() * 0.8 + 0.3, // Smaller stars (was 1.5 + 0.5)
				opacity: Math.random() * 0.4 + 0.4, // Slightly dimmer range
				twinkleSpeed: Math.random() * 0.008 + 0.002, // Slower twinkle (was 0.02 + 0.005)
				twinkleDirection: Math.random() > 0.5 ? 1 : -1
			});
		}
	},
	
	createShootingStar() {
		if (Math.random() < 0.002) { // Low probability for shooting stars
			// Spawn from either top or left edge
			const side = Math.random() < 0.5 ? 0 : 3; // 0: top, 3: left
			let x, y;
			
			// Consistent angle for top-left to bottom-right direction
			const angle = Math.PI / 4; // 45 degrees
			
			switch(side) {
				case 0: // Top edge
					x = Math.random() * this.canvas.width;
					y = 0;
					break;
				case 3: // Left edge
					x = 0;
					y = Math.random() * this.canvas.height;
					break;
			}
			
			this.shootingStars.push({
				x: x,
				y: y,
				length: Math.random() * 80 + 40,
				speed: Math.random() * 8 + 10,
				angle: angle, // All use the same angle now
				opacity: 1,
				tail: []
			});
		}
	},
	
	animate() {
		if (!this.isActive) return;
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		// Draw and update stars
		this.stars.forEach(star => {
			star.opacity += star.twinkleSpeed * star.twinkleDirection;
			
			if (star.opacity >= 1) {
				star.opacity = 1;
				star.twinkleDirection = -1;
			} else if (star.opacity <= 0.3) {
				star.opacity = 0.3;
				star.twinkleDirection = 1;
			}
			
			this.ctx.beginPath();
			this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
			this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
			this.ctx.fill();
			
			// Add glow for larger stars
			if (star.radius > 1) {
				this.ctx.beginPath();
				this.ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
				this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.2})`;
				this.ctx.fill();
			}
		});
		
		// Create shooting stars randomly
		this.createShootingStar();
		
		// Draw and update shooting stars
		this.shootingStars = this.shootingStars.filter(star => {
			star.x += Math.cos(star.angle) * star.speed;
			star.y += Math.sin(star.angle) * star.speed;
			star.opacity -= 0.01;
			
			if (star.opacity <= 0) return false;
			
			// Draw shooting star trail
			const gradient = this.ctx.createLinearGradient(
				star.x, star.y,
				star.x - Math.cos(star.angle) * star.length,
				star.y - Math.sin(star.angle) * star.length
			);
			
			gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
			gradient.addColorStop(0.5, `rgba(200, 220, 255, ${star.opacity * 0.6})`);
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
			
			this.ctx.beginPath();
			this.ctx.moveTo(star.x, star.y);
			this.ctx.lineTo(
				star.x - Math.cos(star.angle) * star.length,
				star.y - Math.sin(star.angle) * star.length
			);
			this.ctx.strokeStyle = gradient;
			this.ctx.lineWidth = 2;
			this.ctx.stroke();
			
			return true;
		});
		
		this.animationFrame = requestAnimationFrame(() => this.animate());
	},
	
	activate(savePreference = true) {
		this.isActive = true;
		const background = document.getElementById('global-background');
		background?.classList.add('night-sky-mode');

		if (savePreference) {
			localStorage.setItem('backgroundMode', 'night-sky');
		}

		if (!this.animationFrame) {
			this.animate();
		}
	},

	deactivate(savePreference = true) {
		this.isActive = false;
		const background = document.getElementById('global-background');
		background?.classList.remove('night-sky-mode');

		if (savePreference) {
			localStorage.setItem('backgroundMode', 'grid');
		}

		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}

		if (this.ctx && this.canvas) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	},
	
	toggle() {
		if (this.isActive) {
			this.deactivate();
		} else {
			this.activate();
		}
	}
};

// ==========================================================================
// PROJECT TAGS OVERFLOW DETECTION
// ==========================================================================

function checkTagsOverflow() {
    // Only run on desktop (min-width: 769px)
    if (window.innerWidth < 769) return;

    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
        const tagContainers = document.querySelectorAll('.project-tags');

        tagContainers.forEach(container => {
            const parent = container.closest('.project-content-bottom');
            if (!parent) return;

            // Check if content overflows (scrollHeight > visible height)
            const hasOverflow = container.scrollHeight > container.clientHeight + 5;
            if (hasOverflow) {
                parent.classList.add('has-overflow');
            } else {
                parent.classList.remove('has-overflow');
            }
        });
    });
}

// Re-check on window resize and load
window.addEventListener('resize', checkTagsOverflow);
window.addEventListener('load', () => {
    // Additional delay to ensure all layout calculations are complete
    setTimeout(checkTagsOverflow, 100);
});

// ==========================================================================
// ABOUT SECTION - AREAS OF WORK (domain bracket tree)
// ==========================================================================
// One column per domain: the name, a sideways brace in the domain color
// pointing up at it, and the domain's disciplines underneath. Columns are a
// fixed width in a centered flex-wrap, so any row that isn't full is centered.

function populateAreaBadges() {
    const container = document.getElementById('area-badges-container');
    if (!container) return;

    const domains = new Map();
    document.querySelectorAll('#projects-grid .project-card').forEach(card => {
        const domain = card.dataset.domain;
        if (!domain) return;
        if (!domains.has(domain)) domains.set(domain, new Set());
        if (card.dataset.discipline) domains.get(domain).add(card.dataset.discipline);
    });

    const brace = '<svg class="domain-brace" width="120" height="14" viewBox="0 0 120 14" fill="none" aria-hidden="true">'
        + '<path d="M2 13C2 8 4 7 8 7H54C58 7 60 5 60 1C60 5 62 7 66 7H112C116 7 118 8 118 13"/></svg>';

    container.innerHTML = Array.from(domains.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([domain, disciplines]) => {
            const items = Array.from(disciplines).sort()
                .map(d => `<li>${d}</li>`).join('');
            return `<div class="domain-group" style="--domain-color: ${domainColorVar(domain)}">`
                + `<h4 class="domain-group-name">${domain}</h4>`
                + brace
                + `<ul class="domain-group-disciplines">${items}</ul>`
                + '</div>';
        })
        .join('');
}

// ==========================================================================
// ABOUT SECTION - NAME TYPING ANIMATION
// ==========================================================================

const NameTyper = {
    element: null,
    text: '',
    hasTyped: false,

    init() {
        this.element = document.querySelector('.about-name');
        if (!this.element) return;

        this.text = this.element.dataset.text || '';
        this.element.textContent = '';

        // Use IntersectionObserver to trigger when about section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasTyped) {
                    this.hasTyped = true;
                    this.type();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.element);
    },

    type() {
        this.element.classList.add('typing');
        let i = 0;
        const speed = 100;

        const typeChar = () => {
            if (i < this.text.length) {
                this.element.textContent += this.text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else {
                // Typing complete - keep cursor blinking briefly then remove
                setTimeout(() => {
                    this.element.classList.remove('typing');
                    this.element.classList.add('typing-done');
                }, 1000);
            }
        };

        typeChar();
    }
};

// ==========================================================================
// ABOUT SECTION - ROTATING QUOTES & SAYINGS
// ==========================================================================

// Two rotators run in the About section: attributed quotes, and the sayings
// block beneath it. They share this implementation — every DOM lookup is
// scoped to cfg.container so neither instance touches the other's text,
// controls, or typing-dots icon.
function createRotator(cfg) {
    return {
        items: cfg.items,
        currentIndex: 0,
        autoRotateInterval: null,

        init() {
            this.root = document.getElementById(cfg.container);
            if (!this.root) return;
            // Items come from a separate data script; bail rather than throw
            // in show() if that file failed to load.
            if (!this.items.length) return;

            this.stage = this.root.querySelector('.rotating-quote');
            this.textEl = this.root.querySelector('.rotating-quote-text');
            this.authorEl = this.root.querySelector('.rotating-quote-author');
            if (!this.stage || !this.textEl || !this.authorEl) return;

            this.createIndicators();
            this.show(0);
            this.setupEventListeners();
            // Stagger the start so the two blocks don't flip in unison.
            setTimeout(() => this.startAutoRotate(), cfg.startDelay || 0);
        },

        createIndicators() {
            const container = this.root.querySelector('.quote-indicators');
            if (!container) return;

            // Universal typing-dots indicator (no per-item dots). Stable at low
            // opacity while an item is showing; three dots bounce in sequence
            // on change via the .animating class added in show().
            container.innerHTML = `
                <div class="quote-icon" aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
            `;
            this.icon = container.querySelector('.quote-icon');
            // The third dot has the latest stagger (0.24s + 0.6s = 0.84s). When
            // its animation ends, all dots are done — safe to drop .animating
            // so the next change can re-trigger cleanly.
            const lastDot = this.icon?.querySelector('span:last-child');
            lastDot?.addEventListener('animationend', () => this.icon.classList.remove('animating'));
        },

        setupEventListeners() {
            this.root.querySelector('[data-rotator-prev]')?.addEventListener('click', () => this.prev());
            this.root.querySelector('[data-rotator-next]')?.addEventListener('click', () => this.next());

            // Touch swipe — left = next, right = previous.
            let startX = 0, startY = 0;
            this.stage.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, { passive: true });
            this.stage.addEventListener('touchend', e => {
                const t = e.changedTouches[0];
                const dx = t.clientX - startX;
                const dy = t.clientY - startY;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                    if (dx < 0) this.next();
                    else this.prev();
                }
            }, { passive: true });
        },

        show(index) {
            // Fade out
            this.textEl.classList.remove('active');
            this.authorEl.classList.remove('active');

            setTimeout(() => {
                // Update content. A saying with no source leaves the cite empty —
                // CSS :empty hides it so no stray em dash is rendered.
                this.textEl.textContent = this.items[index].text;
                this.authorEl.textContent = this.items[index].author || '';

                // Fade in
                this.textEl.classList.add('active');
                this.authorEl.classList.add('active');

                // Pulse the universal icon to signal the item changed.
                if (this.icon) {
                    this.icon.classList.remove('animating');
                    void this.icon.offsetWidth;  // force reflow so the class re-application restarts the animation
                    this.icon.classList.add('animating');
                }

                this.currentIndex = index;
            }, 300);
        },

        next() {
            this.show((this.currentIndex + 1) % this.items.length);
            this.resetAutoRotate();
        },

        prev() {
            this.show((this.currentIndex - 1 + this.items.length) % this.items.length);
            this.resetAutoRotate();
        },

        startAutoRotate() {
            this.autoRotateInterval = setInterval(() => this.next(), cfg.interval);
        },

        resetAutoRotate() {
            clearInterval(this.autoRotateInterval);
            this.startAutoRotate();
        }
    };
}

const QuoteRotator = createRotator({
    container: 'quote-block',
    interval: 8000,
    items: window.QUOTES_DATA || []
});

// Sayings are proverbs rather than authored lines; see js/sayings-data.js for
// how origins are credited.
const SayingRotator = createRotator({
    container: 'saying-block',
    interval: 11000,
    startDelay: 4000,
    items: window.SAYINGS_DATA || []
});

// ==========================================================================
// BLOG SECTION FUNCTIONALITY
// ==========================================================================

// Auto-generate Blog Posts from HTML sections
function generateBlogPostsFromHTML() {
    const postSections = document.querySelectorAll('.post-section');
    const posts = [];

    postSections.forEach(section => {
        const sectionId = section.id;

        // Extract metadata from the post section
        const titleElement = section.querySelector('.post-title');
        const excerptElement = section.querySelector('.post-excerpt');
        const dateElement = section.querySelector('.post-date');
        const categoryElement = section.querySelector('.post-category');
        const imageElement = section.querySelector('.post-featured-image img');
        const tagElements = section.querySelectorAll('.post-tag');
        const contentElement = section.querySelector('.post-content');
        const readTimeElement = section.querySelector('.post-read-time');

        // Calculate read time (average reading speed: 200 words per minute)
        let readTime = 0;
        if (contentElement) {
            const text = contentElement.textContent || contentElement.innerText;
            const wordCount = text.trim().split(/\s+/).length;
            readTime = Math.ceil(wordCount / 200);
        }

        // Populate the read time in the HTML if element exists
        if (readTimeElement && readTime > 0) {
            readTimeElement.textContent = `${readTime} min read`;
        }

        // Extract category key from category text
        const categoryText = categoryElement ? categoryElement.textContent.trim().toLowerCase() : '';
        let categoryKey = 'thoughts';
        if (categoryText.includes('case study')) categoryKey = 'case-study';
        else if (categoryText.includes('tutorial')) categoryKey = 'tutorial';

        // Extract image path (get the src attribute directly)
        let imagePath = '';
        if (imageElement) {
            imagePath = imageElement.getAttribute('src') || imageElement.src;
        }

        // Get content text for card preview (first 300 chars, rounded to full word)
        let contentPreview = '';
        if (contentElement) {
            const fullText = (contentElement.textContent || contentElement.innerText).trim().replace(/\s+/g, ' ');
            if (fullText.length <= 300) {
                contentPreview = fullText;
            } else {
                const truncated = fullText.substring(0, 300);
                const lastSpace = truncated.lastIndexOf(' ');
                contentPreview = (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
            }
        }

        // Build post object
        posts.push({
            id: sectionId,
            title: titleElement ? titleElement.textContent.trim() : '',
            excerpt: excerptElement ? excerptElement.textContent.trim() : '',
            contentPreview: contentPreview,
            date: parseDateFromText(dateElement ? dateElement.textContent.trim() : ''),
            category: categoryKey,
            tags: Array.from(tagElements).map(tag => tag.textContent.trim()),
            image: imagePath,
            section: sectionId,
            readTime: readTime
        });
    });

    return posts;
}

// Parse date from text like "January 15, 2025" to "2025-01-15"
function parseDateFromText(dateText) {
    const date = new Date(dateText);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Blog Posts Data (will be auto-generated from HTML)
let blogPosts = [];

// Blog State Management
const BlogState = {
    currentFilter: 'all',
    searchQuery: '',
    filteredPosts: []
};

// Initialize Blog
function initializeBlog() {
    // Generate blog posts from HTML sections
    blogPosts = generateBlogPostsFromHTML();
    console.log('Generated blog posts:', blogPosts);
    BlogState.filteredPosts = [...blogPosts];
    setupBlogEventListeners();
    renderBlogPosts();
    updatePostCounter();
}

// Setup Blog Event Listeners
function setupBlogEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.blog-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleBlogFilterClick(btn));
    });

    // Search input
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleBlogSearch(e.target.value));
    }
}

// Handle Blog Filter Click
function handleBlogFilterClick(button) {
    // Update active state
    document.querySelectorAll('.blog-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update filter state
    BlogState.currentFilter = button.dataset.filter;

    // Re-filter and render
    applyBlogFilters();
}

// Handle Blog Search
function handleBlogSearch(query) {
    BlogState.searchQuery = query.toLowerCase();
    applyBlogFilters();
}

// Apply Blog Filters
function applyBlogFilters() {
    BlogState.filteredPosts = blogPosts.filter(post => {
        // Filter by category
        const categoryMatch = BlogState.currentFilter === 'all' || post.category === BlogState.currentFilter;

        // Filter by search query
        const searchMatch = BlogState.searchQuery === '' ||
            post.title.toLowerCase().includes(BlogState.searchQuery) ||
            post.excerpt.toLowerCase().includes(BlogState.searchQuery) ||
            post.tags.some(tag => tag.toLowerCase().includes(BlogState.searchQuery));

        return categoryMatch && searchMatch;
    });

    renderBlogPosts();
    updatePostCounter();
}

// Render Blog Posts
function renderBlogPosts() {
    const blogGrid = document.getElementById('blog-grid');
    const noResults = document.getElementById('no-results');

    if (!blogGrid || !noResults) return;

    if (BlogState.filteredPosts.length === 0) {
        blogGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    // Sort by date (newest first)
    const sortedPosts = [...BlogState.filteredPosts].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    // RSS-style feed header
    const feedHeader = `
        <div class="blog-feed-header">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 11a9 9 0 0 1 9 9"></path>
                <path d="M4 4a16 16 0 0 1 16 16"></path>
                <circle cx="5" cy="19" r="1"></circle>
            </svg>
            <span>Feed · ${sortedPosts.length} ${sortedPosts.length === 1 ? 'post' : 'posts'}</span>
        </div>
    `;

    blogGrid.innerHTML = feedHeader + sortedPosts.map((post, index) => createBlogCard(post, sortedPosts.length - index)).join('');
}

// ==========================================================================
// MARKDOWN LOADER - Runtime markdown fetching and parsing
// ==========================================================================

const MarkdownLoader = {
    cache: {},

    // Parse YAML frontmatter from markdown content
    parseFrontmatter(content) {
        content = content.replace(/\r\n/g, '\n');
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            return { metadata: {}, content: content };
        }

        const frontmatter = match[1];
        const markdown = match[2];
        const metadata = {};

        const lines = frontmatter.split('\n');
        let currentKey = null;
        let currentArray = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.startsWith('-')) {
                if (currentArray) {
                    currentArray.push(trimmed.substring(1).trim());
                }
                return;
            }

            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > -1) {
                const key = trimmed.substring(0, colonIndex).trim();
                const value = trimmed.substring(colonIndex + 1).trim();
                const cleanValue = value.replace(/^["']|["']$/g, '');

                if (cleanValue === '') {
                    currentKey = key;
                    currentArray = [];
                    metadata[key] = currentArray;
                } else {
                    metadata[key] = cleanValue;
                    currentKey = null;
                    currentArray = null;
                }
            }
        });

        return { metadata, content: markdown };
    },

    // Escape HTML entities
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // Convert Markdown to HTML
    markdownToHtml(markdown) {
        let html = markdown;

        // Headers (with space after #)
        html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Code blocks with HTML escaping
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return '<pre><code>' + this.escapeHtml(code.trim()) + '</code></pre>';
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Horizontal rules
        html = html.replace(/^---$/gim, '<hr>');

        // Process paragraphs and lists
        const lines = html.split('\n');
        let result = [];
        let inList = false;
        let listItems = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) {
                if (inList && listItems.length > 0) {
                    result.push('<ul>' + listItems.join('') + '</ul>');
                    listItems = [];
                    inList = false;
                }
                continue;
            }

            // Unordered list items
            if (trimmed.match(/^[-*] (.+)$/)) {
                inList = true;
                const content = trimmed.replace(/^[-*] /, '');
                listItems.push('<li>' + content + '</li>');
                continue;
            }

            // Ordered list items
            if (trimmed.match(/^\d+\. (.+)$/)) {
                inList = true;
                const content = trimmed.replace(/^\d+\. /, '');
                listItems.push('<li>' + content + '</li>');
                continue;
            }

            // Close list if we hit non-list content
            if (inList && listItems.length > 0) {
                result.push('<ul>' + listItems.join('') + '</ul>');
                listItems = [];
                inList = false;
            }

            // Skip if already an HTML tag
            if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
                result.push(trimmed);
                continue;
            }

            // Wrap in paragraph if plain text
            if (!trimmed.startsWith('<')) {
                result.push('<p>' + trimmed + '</p>');
            } else {
                result.push(trimmed);
            }
        }

        // Close any remaining list
        if (listItems.length > 0) {
            result.push('<ul>' + listItems.join('') + '</ul>');
        }

        return result.join('\n');
    },

    // Fetch and render markdown for a post
    async loadPost(postId) {
        // Extract filename from post ID (e.g., "post-blot-world-case-study" -> "blot-world-case-study")
        const filename = postId.replace(/^post-/, '');
        const mdPath = `blog/posts/${filename}.md`;

        // Check cache first
        if (this.cache[postId]) {
            this.renderToSection(postId, this.cache[postId]);
            return;
        }

        try {
            const response = await fetch(mdPath);
            if (!response.ok) {
                console.error(`Failed to fetch markdown: ${mdPath}`);
                return;
            }

            const mdContent = await response.text();
            const { metadata, content } = this.parseFrontmatter(mdContent);
            const htmlContent = this.markdownToHtml(content);

            // Cache the result
            this.cache[postId] = { metadata, htmlContent };

            // Render to the section
            this.renderToSection(postId, { metadata, htmlContent });

        } catch (error) {
            console.error('Error loading markdown:', error);
        }
    },

    // Render parsed content to the post section
    renderToSection(postId, { metadata, htmlContent }) {
        const section = document.getElementById(postId);
        if (!section) return;

        const contentElement = section.querySelector('.post-content');
        if (contentElement) {
            contentElement.innerHTML = htmlContent;
        }

        // Update read time
        const readTimeElement = section.querySelector('.post-read-time');
        if (readTimeElement && contentElement) {
            const wordCount = contentElement.textContent.split(/\s+/).length;
            const readTime = Math.ceil(wordCount / 200);
            readTimeElement.textContent = `${readTime} min read`;
        }
    }
};

// Create Blog Card HTML - RSS Feed Style
function createBlogCard(post, postNumber) {
    const formattedDate = formatBlogDateRSS(post.date);
    const readTime = post.readTime ? `${post.readTime} min` : '';

    return `
        <a href="#" data-section="${post.section}" class="blog-card" data-post-id="${post.id}">
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-date">${formattedDate}</span>
                    ${readTime ? `<span class="blog-card-read-time">${readTime}</span>` : ''}
                </div>
                <h2 class="blog-card-title">${post.title}</h2>
            </div>
        </a>
    `;
}

// Update Post Counter
function updatePostCounter() {
    const visibleCount = document.getElementById('visible-posts');
    const totalCount = document.getElementById('total-posts');

    if (visibleCount && totalCount) {
        visibleCount.textContent = BlogState.filteredPosts.length;
        totalCount.textContent = blogPosts.length;
    }
}

// Format Blog Date
function formatBlogDate(dateString) {
    // Force UTC to avoid timezone shifts
    const date = new Date(dateString + 'T00:00:00Z');
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString('en-US', options);
}

// Format Blog Date - RSS Style (e.g., "Dec 27, 2025")
function formatBlogDateRSS(dateString) {
    const date = new Date(dateString + 'T00:00:00Z');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    return `${month} ${day}, ${year}`;
}

// Get Blog Category Label
function getBlogCategoryLabel(category) {
    const labels = {
        'case-study': 'Case Study',
        'tutorial': 'Tutorial',
        'thoughts': 'Thoughts'
    };
    return labels[category] || category;
}

// ==========================================================================
// MOBILE TAG WRAPPING
// ==========================================================================

function wrapTechTagsOnMobile() {
    if (window.innerWidth > 768) return;  // Only on mobile

    document.querySelectorAll('.project-tags').forEach(tagsContainer => {
        // Check if already wrapped
        if (tagsContainer.querySelector('.tech-tags-wrapper')) return;

        // Find area badge and tech tags
        const areaBadge = tagsContainer.querySelector('.project-area-badge');
        const techTags = Array.from(tagsContainer.querySelectorAll('.tag:not(.more-tag)'));

        if (techTags.length === 0) return;

        // Create wrapper for tech tags
        const wrapper = document.createElement('div');
        wrapper.className = 'tech-tags-wrapper';

        // Move tech tags into wrapper
        techTags.forEach(tag => {
            wrapper.appendChild(tag);
        });

        // Append wrapper to container (after area badge)
        tagsContainer.appendChild(wrapper);
    });
}

// ==========================================================================
// MOBILE TAG LIMITING
// ==========================================================================

function limitTagsOnMobile() {
    if (window.innerWidth > 768) return;  // Only on mobile

    document.querySelectorAll('.tech-tags-wrapper').forEach(wrapper => {
        const tags = Array.from(wrapper.querySelectorAll('.tag:not(.more-tag)'));
        if (tags.length === 0) return;

        // Remove existing "+N more" tag if present
        const existingMore = wrapper.querySelector('.more-tag');
        if (existingMore) existingMore.remove();

        // Check if container is overflowing (has more content than visible)
        const isOverflowing = wrapper.scrollHeight > wrapper.clientHeight;

        if (isOverflowing) {
            // Count tags that are cut off
            const wrapperBottom = wrapper.getBoundingClientRect().bottom;
            let hiddenCount = 0;

            tags.forEach(tag => {
                const tagBottom = tag.getBoundingClientRect().bottom;
                if (tagBottom > wrapperBottom + 2) { // +2px tolerance
                    hiddenCount++;
                }
            });

            // Add "+N more" indicator if there are hidden tags
            if (hiddenCount > 0) {
                const moreTag = document.createElement('span');
                moreTag.className = 'tag more-tag';
                moreTag.textContent = `+${hiddenCount} more`;
                wrapper.appendChild(moreTag);
            }
        }
    });
}

// Call on page load and resize
window.addEventListener('resize', () => {
    wrapTechTagsOnMobile();
    limitTagsOnMobile();
});
window.addEventListener('load', () => {
    wrapTechTagsOnMobile();
    limitTagsOnMobile();
    appendSeriesToTitles();
});

// ==========================================================================
// SERIES IN TITLES
// ==========================================================================

function appendSeriesToTitles() {
    document.querySelectorAll('.project-card').forEach(card => {
        const series = card.getAttribute('data-series');
        if (series) {
            const titleElement = card.querySelector('.project-header h3');
            if (titleElement && !titleElement.textContent.includes(`(${series})`)) {
                titleElement.textContent = `${titleElement.textContent} (${series})`;
            }
        }
    });
}

// ==========================================================================
// END OF SCRIPT
// ==========================================================================