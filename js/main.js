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
		const wrapper = document.querySelector('.hero-title-wrapper');
		if (wrapper) {
			wrapper.classList.remove('animate');
			void wrapper.offsetWidth; // Force reflow
			setTimeout(() => wrapper.classList.add('animate'), 50);
		}
	},
	
	initRotatingTagline() {
		const rotator = document.querySelector('.tagline-rotator');
		if (!rotator) return;
		
		const phrases = rotator.querySelectorAll('span');
		let currentIndex = 0;
		
		setInterval(() => {
			phrases[currentIndex].classList.remove('active');
			currentIndex = (currentIndex + 1) % phrases.length;
			phrases[currentIndex].classList.add('active');
		}, 3000);
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
		
		projectCards.forEach(card => {
			const area = card.querySelector('.project-card')?.dataset.area;
			const tech = card.querySelector('.project-card')?.dataset.tech;
			
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
		
		this.updateCounter(visibleCount, projectCards.length);
		
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
// 8. INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loading');
    
    Navigation.init();
    HeroAnimations.initRotatingTagline();
    FilterSystem.init();
    ProjectsPreview.populate();
    populateAreaBadges();

    // Initialize project counter
    const totalProjects = document.querySelectorAll('#projects-grid .project-card').length;
    FilterSystem.updateCounter(totalProjects, totalProjects);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Navigation.closeMobileMenu();
        }
    });

    NightSky.init();
    document.getElementById('bg-toggle-btn')?.addEventListener('click', () => {
        NightSky.toggle();
    });
});


// ==========================================================================
// 9. INCEPTION PROTECTION
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
// 10. NIGHT SKY BACKGROUND
// ==========================================================================

const NightSky = {
	canvas: null,
	ctx: null,
	stars: [],
	shootingStars: [],
	animationFrame: null,
	isActive: false,
	
	init() {
		this.canvas = document.getElementById('night-sky-canvas');
		if (!this.canvas) return;
		
		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();
		this.createStars();
		
		window.addEventListener('resize', () => this.resizeCanvas());
		
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
}

// ==========================================================================
// END OF SCRIPT
// ==========================================================================