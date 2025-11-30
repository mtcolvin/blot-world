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
// 1. STATE MANAGEMENT
// ==========================================================================

const AppState = {
	activeFilters: {
		status: ['all'],
		area: [],
		tech: [],
		sort: 'date-desc'
	},

	currentSection: 'home',

	resetFilters() {
		this.activeFilters = {
			status: ['all'],
			area: [],
			tech: [],
			sort: 'date-desc'
		};
	}
};

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
				}
				
				// Update URL
				this.updateURL(sectionId);
				
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
		const previewCount = Math.min(6, projectCardLinks.length);

		for (let i = 0; i < previewCount; i++) {
			const clonedLink = projectCardLinks[i].cloneNode(true);
			previewGrid.appendChild(clonedLink);
		}

		// Re-apply AI project styling after cloning
		markAIProjects();
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
// 5. FILTER SYSTEM
// ==========================================================================

const FilterSystem = {
	init() {
		this.generateDynamicFilters();
		// Add delay before attaching listeners
		setTimeout(() => {
			this.attachEventListeners();
			this.initCollapsibleSections();
		}, 200);
	},

	initCollapsibleSections() {
		const headers = document.querySelectorAll('.filter-section-header');
		headers.forEach(header => {
			header.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				const section = header.closest('.collapsible-section');
				section.classList.toggle('collapsed');
			});
		});
	},
	
	generateDynamicFilters() {
		const projects = document.querySelectorAll('#projects-grid .project-card');
		const techCounts = new Map();
		const areaCounts = new Map();
		
		projects.forEach(project => {
			const area = project.dataset.area;
			if (area) {
				areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
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
		
		this.buildAreaFilters(areaCounts);
		this.buildTechFilters(techCounts);
	},
	
	buildAreaFilters(areaCounts) {
		const container = document.getElementById('area-filter-options');
		if (!container) return;
		
		container.innerHTML = '';
		
		const sortedAreas = Array.from(areaCounts.entries())
			.sort((a, b) => a[0].localeCompare(b[0]));
		
		sortedAreas.forEach(([area, count]) => {
			const option = this.createFilterOption('area', area, area, count);
			container.appendChild(option);
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
		
		if (filterType === 'area') {
			if (checkbox.classList.contains('checked')) {
				checkbox.classList.remove('checked');
				AppState.activeFilters.area = AppState.activeFilters.area
					.filter(area => area !== filterValue);
			} else {
				checkbox.classList.add('checked');
				AppState.activeFilters.area.push(filterValue);
			}
		} else if (filterType === 'tech') {
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

		projectCards.forEach(card => {
			const area = card.querySelector('.project-card')?.dataset.area;
			const tech = card.querySelector('.project-card')?.dataset.tech;

			// Skip poetry card if it's not visible
			if (card.id === 'poetry-card' && !isPoetrVisible) {
				return;
			}

			const areaMatch = AppState.activeFilters.area.length === 0 ||
							AppState.activeFilters.area.includes(area);

			const techMatch = AppState.activeFilters.tech.length === 0 ||
							AppState.activeFilters.tech.some(filterTech =>
								tech && tech.toLowerCase().includes(filterTech.toLowerCase())
							);

			if (areaMatch && techMatch) {
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
		
		AppState.activeFilters.area.forEach(area => {
			const checkbox = document.querySelector(
				`[data-filter="area"][data-value="${area}"] .filter-checkbox`
			);
			if (checkbox) checkbox.classList.add('checked');
		});
		
		AppState.activeFilters.tech.forEach(tech => {
			const checkbox = document.querySelector(
				`[data-filter="tech"][data-value="${tech}"] .filter-checkbox`
			);
			if (checkbox) checkbox.classList.add('checked');
		});
		
		this.applyFilters();
	},
	
	clearAll() {
		document.querySelectorAll('.filter-checkbox').forEach(cb => {
			cb.classList.remove('checked');
		});

		document.getElementById('sort-select').value = 'date-desc';

		AppState.resetFilters();
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
		
		if (visibleEl) visibleEl.textContent = visible;
		if (totalEl) totalEl.textContent = total;
	},
	
	regenerateWithSelections() {
		const currentSelections = {
			area: [...AppState.activeFilters.area],
			tech: [...AppState.activeFilters.tech]
		};
		
		this.generateDynamicFilters();
		
		AppState.activeFilters.area = currentSelections.area;
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
		
		AppState.activeFilters.area.forEach(area => {
			const checkbox = document.querySelector(
				`[data-filter="area"][data-value="${area}"] .filter-checkbox`
			);
			if (checkbox) checkbox.classList.add('checked');
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

		if (AppState.activeFilters.area.length > 0) {
			params.set('area', AppState.activeFilters.area.join(','));
		}

		if (AppState.activeFilters.tech.length > 0) {
			params.set('tech', AppState.activeFilters.tech.join(','));
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
			area: [],
			tech: [],
			sort: 'date-desc'
		};

		if (urlParams.has('area')) {
			filters.area = urlParams.get('area').split(',');
		}

		if (urlParams.has('tech')) {
			filters.tech = urlParams.get('tech').split(',');
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
// 8. AI PROJECT DETECTION
// ==========================================================================

function markAIProjects() {
    const aiNames = ['claude', 'chatgpt', 'grok', 'gemini'];
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        const tech = card.dataset.tech?.toLowerCase() || '';
        const name = card.dataset.name?.toLowerCase() || '';
        const combinedText = title + ' ' + description + ' ' + tech + ' ' + name;

        // Check if any AI name is present
        const hasAIName = aiNames.some(aiName => combinedText.includes(aiName));

        if (hasAIName) {
            card.classList.add('ai-project');
            console.log('AI project detected:', card.dataset.name);
        }
    });
}

// ==========================================================================
// 9. INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loading');

    Navigation.init();
    HeroAnimations.initRotatingTagline();
    FilterSystem.init();
    ProjectsPreview.populate();
    populateAreaBadges();
    initializeBlog();
    QuoteRotator.init();
    markAIProjects();

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

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Navigation.closeMobileMenu();
        }
    });

    NightSky.init();
    document.getElementById('bg-toggle-btn')?.addEventListener('click', () => {
        NightSky.toggle();

        // Toggle poetry card visibility
        const poetryCard = document.getElementById('poetry-card');
        if (poetryCard) {
            poetryCard.classList.toggle('visible');

            // Save state to localStorage
            const isVisible = poetryCard.classList.contains('visible');
            localStorage.setItem('poetryCardVisible', isVisible);

            // Update project counter
            updateProjectCounter();
        }
    });

    // Restore poetry card visibility on page load
    const savedPoetryState = localStorage.getItem('poetryCardVisible');
    if (savedPoetryState === 'true') {
        document.getElementById('poetry-card')?.classList.add('visible');
        updateProjectCounter();
    }
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

		// Default to night-sky unless user chose grid
		const savedMode = localStorage.getItem('backgroundMode');

		if (savedMode === 'grid') {
			this.deactivate(); // explicit choice to use grid
		} else {
			this.activate(); // default to night-sky
		}
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
	
	activate() {
		this.isActive = true;
		const background = document.getElementById('global-background');
		background?.classList.add('night-sky-mode');
		
		// Save preference
		localStorage.setItem('backgroundMode', 'night-sky');
		
		if (!this.animationFrame) {
			this.animate();
		}
	},
	
	deactivate() {
		this.isActive = false;
		const background = document.getElementById('global-background');
		background?.classList.remove('night-sky-mode');
		
		// Save preference
		localStorage.setItem('backgroundMode', 'grid');
		
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
// ABOUT SECTION - AUTO-POPULATE AREA BADGES
// ==========================================================================

function populateAreaBadges() {
    const container = document.getElementById('area-badges-container');
    if (!container) return;

    // Get all unique areas from project cards
    const projectCards = document.querySelectorAll('#projects-grid .project-card');
    const areas = new Set();

    projectCards.forEach(card => {
        const area = card.dataset.area;
        if (area) {
            areas.add(area);
        }
    });

    // Convert to array and sort alphabetically
    const sortedAreas = Array.from(areas).sort();

    // Clear container and create badge elements
    container.innerHTML = '';
    sortedAreas.forEach(area => {
        const badge = document.createElement('span');
        badge.className = 'area-badge';
        badge.textContent = area;
        container.appendChild(badge);
    });

    // Calculate optimal items per row to avoid orphans
    const totalBadges = sortedAreas.length;
    if (totalBadges > 0) {
        // Find the best number of items per row (between 3-5)
        let optimalPerRow = 4; // default

        for (let perRow = 3; perRow <= 5; perRow++) {
            const rows = Math.ceil(totalBadges / perRow);
            const lastRowCount = totalBadges % perRow || perRow;

            // Prefer layouts where the last row has at least half the items
            if (lastRowCount >= Math.ceil(perRow / 2)) {
                optimalPerRow = perRow;
                break;
            }
        }

        // Set CSS custom property to control grid layout
        container.style.setProperty('--items-per-row', optimalPerRow);
    }
}

// ==========================================================================
// ABOUT SECTION - ROTATING QUOTES
// ==========================================================================

const QuoteRotator = {
    quotes: [
        {
            text: "So remember to look up at the stars and not down at your feet. Try to make sense of what you see and hold on to that childlike wonder about what makes the universe exist.",
            author: "Stephen Hawking"
        },
        {
            text: "He ought to find it more profitable to play by the rules than to undermine the system.",
            author: "Satoshi Nakamoto"
        },
        {
            text: "If I have seen further, it is by standing on the shoulders of giants.",
            author: "Isaac Newton"
        },
        {
            text: "Not knowing when the dawn will come I open every door.",
            author: "Emily Dickinson"
        },
        {
            text: "If you want the rainbow, you got to put up with the rain.",
            author: "Dolly Parton"
        },
        {
            text: "We do not inherit the earth from our ancestors; we borrow it from our children.",
            author: "Proverb"
        }
    ],
    currentIndex: 0,
    autoRotateInterval: null,

    init() {
        if (!document.getElementById('rotating-quote')) return;

        this.createIndicators();
        this.showQuote(0);
        this.setupEventListeners();
        this.startAutoRotate();
    },

    createIndicators() {
        const container = document.getElementById('quote-indicators');
        if (!container) return;

        container.innerHTML = '';
        this.quotes.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'quote-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToQuote(index));
            container.appendChild(indicator);
        });
    },

    setupEventListeners() {
        document.getElementById('quote-prev')?.addEventListener('click', () => this.prevQuote());
        document.getElementById('quote-next')?.addEventListener('click', () => this.nextQuote());
    },

    showQuote(index) {
        const quoteText = document.querySelector('.rotating-quote-text');
        const quoteAuthor = document.querySelector('.rotating-quote-author');

        if (!quoteText || !quoteAuthor) return;

        // Fade out
        quoteText.classList.remove('active');
        quoteAuthor.classList.remove('active');

        setTimeout(() => {
            // Update content
            quoteText.textContent = this.quotes[index].text;
            quoteAuthor.textContent = this.quotes[index].author;

            // Fade in
            quoteText.classList.add('active');
            quoteAuthor.classList.add('active');

            // Update indicators
            document.querySelectorAll('.quote-indicator').forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });

            this.currentIndex = index;
        }, 300);
    },

    nextQuote() {
        const nextIndex = (this.currentIndex + 1) % this.quotes.length;
        this.showQuote(nextIndex);
        this.resetAutoRotate();
    },

    prevQuote() {
        const prevIndex = (this.currentIndex - 1 + this.quotes.length) % this.quotes.length;
        this.showQuote(prevIndex);
        this.resetAutoRotate();
    },

    goToQuote(index) {
        this.showQuote(index);
        this.resetAutoRotate();
    },

    startAutoRotate() {
        this.autoRotateInterval = setInterval(() => {
            this.nextQuote();
        }, 8000); // Change quote every 8 seconds
    },

    resetAutoRotate() {
        clearInterval(this.autoRotateInterval);
        this.startAutoRotate();
    }
};

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

        // Build post object
        posts.push({
            id: sectionId,
            title: titleElement ? titleElement.textContent.trim() : '',
            excerpt: excerptElement ? excerptElement.textContent.trim() : '',
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

    blogGrid.innerHTML = sortedPosts.map(post => createBlogCard(post)).join('');

    // Adjust tags to fit one line after rendering
    adjustBlogCardTags();
}

// Adjust blog card tags to show fixed number
function adjustBlogCardTags() {
    const MAX_VISIBLE_TAGS = 5;
    const tagContainers = document.querySelectorAll('.blog-card-tags');

    tagContainers.forEach(container => {
        const tags = Array.from(container.querySelectorAll('.blog-tag:not(.blog-tag-more)'));
        const totalTags = parseInt(container.dataset.totalTags);

        if (tags.length === 0) return;

        // Remove any existing "+more" tags first
        const existingMoreTag = container.querySelector('.blog-tag-more');
        if (existingMoreTag) {
            existingMoreTag.remove();
        }

        // Show only first MAX_VISIBLE_TAGS
        tags.forEach((tag, index) => {
            if (index < MAX_VISIBLE_TAGS) {
                tag.style.display = '';
            } else {
                tag.style.display = 'none';
            }
        });

        // Add "+X more" tag if there are hidden tags
        if (totalTags > MAX_VISIBLE_TAGS) {
            const remainingCount = totalTags - MAX_VISIBLE_TAGS;
            const moreTag = document.createElement('span');
            moreTag.className = 'blog-tag blog-tag-more';
            moreTag.textContent = `+${remainingCount} more`;
            container.appendChild(moreTag);
        }
    });
}

// Create Blog Card HTML
function createBlogCard(post) {
    const formattedDate = formatBlogDate(post.date);
    const categoryLabel = getBlogCategoryLabel(post.category);
    const readTime = post.readTime ? `${post.readTime} min read` : '';

    return `
        <a href="#" data-section="${post.section}" class="blog-card" data-post-id="${post.id}">
            <div class="blog-card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${formattedDate}
                    </span>
                    <span class="blog-card-category">${categoryLabel}</span>
                    ${readTime ? `<span class="blog-card-read-time">${readTime}</span>` : ''}
                </div>
                <h2 class="blog-card-title">${post.title}</h2>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-tags" data-total-tags="${post.tags.length}">
                    ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
                <span class="blog-card-read-more">
                    Read more
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </span>
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
// END OF SCRIPT
// ==========================================================================