// Dynamic filter generation
function generateDynamicFilters() {
	const projects = document.querySelectorAll('#projects-grid .project-card-link .project-card');
	const techCounts = new Map();
	const areaCounts = new Map();
	const statusCounts = {
		'completed': 0,
		'in-progress': 0,
		'planned': 0
	};
	let totalProjects = projects.length;
	
	// Scan all projects to collect data
	projects.forEach(project => {
		// Count statuses
		const status = project.dataset.status;
		if (statusCounts[status] !== undefined) {
			statusCounts[status]++;
		}
		
		// Count areas
		const area = project.dataset.area;
		if (area) {
			areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
		}
		
		// Count technologies
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
	
	// Build status filters
	buildStatusFilters(statusCounts, totalProjects);
	
	// Build area filters
	buildAreaFilters(areaCounts);
	
	// Build technology filters
	buildTechFilters(techCounts);
	
	// Attach event listeners to new filter options
	attachFilterEventListeners();
}

function buildStatusFilters(statusCounts, totalProjects) {
	const container = document.getElementById('status-filter-options');
	if (!container) return;
	
	// Clear existing content
	container.innerHTML = '';
	
	// Add "All" option first
	const allOption = createFilterOption('status', 'all', 'All', totalProjects, true);
	container.appendChild(allOption);
	
	// Add individual status options
	const statusLabels = {
		'completed': 'Completed',
		'in-progress': 'In Progress',
		'planned': 'Planned'
	};
	
	Object.entries(statusCounts).forEach(([status, count]) => {
		if (count > 0) { // Only show statuses that have projects
			const option = createFilterOption('status', status, statusLabels[status], count, false);
			container.appendChild(option);
		}
	});
}

function buildAreaFilters(areaCounts) {
	const container = document.getElementById('area-filter-options');
	if (!container) return;
	
	// Clear existing content
	container.innerHTML = '';
	
	// Sort areas alphabetically
	const sortedAreas = Array.from(areaCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	
	sortedAreas.forEach(([area, count]) => {
		const option = createFilterOption('area', area, area, count, false);
		container.appendChild(option);
	});
}

function buildTechFilters(techCounts) {
	const container = document.getElementById('tech-filter-options');
	if (!container) return;
	
	// Clear existing content
	container.innerHTML = '';
	
	// Sort technologies alphabetically
	const sortedTechs = Array.from(techCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	
	sortedTechs.forEach(([tech, count]) => {
		const option = createFilterOption('tech', tech, tech, count, false);
		container.appendChild(option);
	});
}

function createFilterOption(filterType, value, label, count, isChecked) {
	const optionDiv = document.createElement('div');
	optionDiv.className = 'filter-option';
	optionDiv.dataset.filter = filterType;
	optionDiv.dataset.value = value;
	
	const checkbox = document.createElement('div');
	checkbox.className = isChecked ? 'filter-checkbox checked' : 'filter-checkbox';
	
	const labelSpan = document.createElement('span');
	labelSpan.textContent = label;
	
	const countSpan = document.createElement('span');
	countSpan.className = 'filter-count';
	countSpan.textContent = count;
	
	optionDiv.appendChild(checkbox);
	optionDiv.appendChild(labelSpan);
	optionDiv.appendChild(countSpan);
	
	return optionDiv;
}

function attachFilterEventListeners() {
	// Add click handlers to all filter options
	document.querySelectorAll('.filter-option').forEach(option => {
		option.addEventListener('click', handleFilterClick);
	});
}

function regenerateFiltersWithSelections() {
	// Store current selections
	const currentSelections = {
		status: [...activeFilters.status],
		tech: [...activeFilters.tech]
	};
	
	// Regenerate filters (this will update counts based on visible projects)
	generateDynamicFilters();
	
	// Restore selections
	activeFilters.status = currentSelections.status;
	activeFilters.tech = currentSelections.tech;
	
	// Update UI to reflect restored selections
	restoreFilterSelections();
}

function restoreFilterSelections() {
	// Clear all checkboxes first
	document.querySelectorAll('.filter-checkbox').forEach(cb => {
		cb.classList.remove('checked');
	});
	
	// Restore status selections
	activeFilters.status.forEach(status => {
		const option = document.querySelector(`[data-filter="status"][data-value="${status}"] .filter-checkbox`);
		if (option) {
			option.classList.add('checked');
		}
	});
	
	// Restore area selections
	activeFilters.area.forEach(area => {
		const option = document.querySelector(`[data-filter="area"][data-value="${area}"] .filter-checkbox`);
		if (option) {
			option.classList.add('checked');
		}
	});
	
	// Restore tech selections
	activeFilters.tech.forEach(tech => {
		const option = document.querySelector(`[data-filter="tech"][data-value="${tech}"] .filter-checkbox`);
		if (option) {
			option.classList.add('checked');
		}
	});
}

// Project filtering and sorting state
let activeFilters = {
	status: ['all'],
	area: [],
	tech: [],
	sort: 'default'
};

// Populate projects preview on home page
function populateProjectsPreview() {
	const previewGrid = document.getElementById('projects-preview-grid');
	const mainProjectsGrid = document.getElementById('projects-grid');
	
	if (!previewGrid || !mainProjectsGrid) return;
	
	// Clear existing preview content
	previewGrid.innerHTML = '';
	
	// Get the first 6 project cards
	const projectCards = mainProjectsGrid.querySelectorAll('.project-card');
	const previewCount = Math.min(6, projectCards.length);
	
	for (let i = 0; i < previewCount; i++) {
		const originalCard = projectCards[i];
		const clonedCard = originalCard.cloneNode(true);
		
		// Remove the href so preview cards navigate to projects section instead
		if (clonedCard.tagName === 'A') {
			clonedCard.removeAttribute('href');
			clonedCard.style.cursor = 'pointer';
			clonedCard.addEventListener('click', function(e) {
				e.preventDefault();
				showSection('projects');
			});
		}
		
		previewGrid.appendChild(clonedCard);
	}
}

// Filter option management
function handleFilterClick(event) {
	const filterOption = event.currentTarget;
	const filterType = filterOption.dataset.filter;
	const filterValue = filterOption.dataset.value;
	const checkbox = filterOption.querySelector('.filter-checkbox');

	if (filterType === 'status') {
		// Clear all status filters first
		document.querySelectorAll('[data-filter="status"] .filter-checkbox').forEach(cb => {
			cb.classList.remove('checked');
		});
		activeFilters.status = [];
		
		// Set new status filter
		checkbox.classList.add('checked');
		activeFilters.status = [filterValue];
		
	} else if (filterType === 'area') {
		// Toggle area filter
		if (checkbox.classList.contains('checked')) {
			checkbox.classList.remove('checked');
			activeFilters.area = activeFilters.area.filter(area => area !== filterValue);
		} else {
			checkbox.classList.add('checked');
			activeFilters.area.push(filterValue);
		}
		
	} else if (filterType === 'tech') {
		// Toggle tech filter
		if (checkbox.classList.contains('checked')) {
			checkbox.classList.remove('checked');
			activeFilters.tech = activeFilters.tech.filter(tech => tech !== filterValue);
		} else {
			checkbox.classList.add('checked');
			activeFilters.tech.push(filterValue);
		}
		
	} 

	// Apply filters
	filterProjects();
}

function handleSortChange(selectElement) {
	const sortValue = selectElement.value;
	activeFilters.sort = sortValue;
	filterProjects();
}

function clearAllFilters() {
	// Reset all checkboxes
	document.querySelectorAll('.filter-checkbox').forEach(cb => {
		cb.classList.remove('checked');
	});
	
	// Set "All" status as checked
	const allStatusOption = document.querySelector('[data-filter="status"][data-value="all"] .filter-checkbox');
	if (allStatusOption) {
		allStatusOption.classList.add('checked');
	}			
	// Reset dropdown
	document.getElementById('sort-select').value = 'default';
	
	// Reset active filters
	activeFilters = {
		status: ['all'],
		area: [],
		tech: [],
		sort: 'default'
	};
	
	filterProjects();
}

// Section navigation
function showSection(sectionId) {
    // Show loader and hide scrollbar for section transitions
    const loader = document.getElementById('loader');
    document.body.classList.add('loading');  // Hide scrollbar
    loader.classList.remove('hidden');
    
    // Wait for loader to be fully visible before proceeding
    setTimeout(() => {
        // Hide all sections first
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Hide projects preview when leaving home section
        if (sectionId !== 'home') {
            hideProjectsPreview();
            // Remove scroll listener when leaving home
            window.removeEventListener('scroll', handleScrollForPreview);
        }

        // Show the selected section after sections are hidden
        setTimeout(() => {
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            //Update URL hash
            if (sectionId === 'projects') {
                // For projects, check if we need to apply filters from URL
                const urlFilters = parseFiltersFromURL();
                if (JSON.stringify(urlFilters) !== JSON.stringify(activeFilters)) {
                    activeFilters = urlFilters;
                    applyFiltersFromState();
                }
                updateURL(sectionId, true);
            } else {
                updateURL(sectionId);
            }

            // Trigger hero animations when showing home section
            if (sectionId === 'home') {
                setTimeout(triggerHeroAnimations, 100);
                // Add scroll listener to show projects preview
                window.addEventListener('scroll', handleScrollForPreview);
            }

            // Update active nav state
            updateNavState(sectionId);

            // Close mobile menu and filter sidebar if open
            closeMobileMenu();

            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Hide loader and restore scrollbar after section is loaded
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('loading');  // Restore scrollbar
            }, 200);
            
        }, 100); // Wait 100ms for sections to hide
        
    }, 500); // Wait 500ms for loader to be fully visible (matches CSS transition)
}

// Apply filter state to UI checkboxes and dropdowns
function applyFiltersFromState() {
	// Update dropdown
	document.getElementById('sort-select').value = activeFilters.sort;
	
	// Clear all checkboxes first
	document.querySelectorAll('.filter-checkbox').forEach(cb => {
		cb.classList.remove('checked');
	});
	
	// Apply status filters
	activeFilters.status.forEach(status => {
		const checkbox = document.querySelector(`[data-filter="status"][data-value="${status}"] .filter-checkbox`);
		if (checkbox) checkbox.classList.add('checked');
	});
	
	// Apply area filters
	activeFilters.area.forEach(area => {
		const checkbox = document.querySelector(`[data-filter="area"][data-value="${area}"] .filter-checkbox`);
		if (checkbox) checkbox.classList.add('checked');
	});
	
	// Apply tech filters
	activeFilters.tech.forEach(tech => {
		const checkbox = document.querySelector(`[data-filter="tech"][data-value="${tech}"] .filter-checkbox`);
		if (checkbox) checkbox.classList.add('checked');
	});
	
	// Apply the filters
	filterProjects();
}

// Update URL with section and optional filter parameters
function updateURL(sectionId, updateFilters = false) {
	let newURL = window.location.pathname;
	
	// Add filter parameters first (before hash)
	if (sectionId === 'projects' && updateFilters) {
		const filterParams = serializeFiltersToURL();
		if (filterParams) {
			newURL += `?${filterParams}`;
		}
	}
	
	// Then add hash (if not home)
	if (sectionId !== 'home') {
		newURL += `#${sectionId}`;
	}
	
	// Update URL without triggering navigation
	window.history.pushState(null, null, newURL);
}

// Function to trigger hero animations with proper reset
function triggerHeroAnimations() {
	const heroTitleWrapper = document.querySelector('.hero-title-wrapper');
	if (heroTitleWrapper) {
		// Remove class first to reset animation if it was already playing
		heroTitleWrapper.classList.remove('animate');
		
		// Force browser reflow to ensure animation restarts
		void heroTitleWrapper.offsetWidth;
		
		// Add class back to trigger animation
		setTimeout(() => {
			heroTitleWrapper.classList.add('animate');
		}, 50);
	}
}

// Function to show the projects preview section
function showProjectsPreview() {
	const previewSection = document.querySelector('.projects-preview-section');
	if (previewSection) {
		previewSection.classList.add('visible');
	}
}

// Function to hide the projects preview section (for when leaving home)
function hideProjectsPreview() {
	const previewSection = document.querySelector('.projects-preview-section');
	if (previewSection) {
		previewSection.classList.remove('visible');
	}
}

// Function to handle scroll and show projects preview
function handleScrollForPreview() {
	// Only trigger on home section
	if (!document.getElementById('home').classList.contains('active')) {
		return;
	}
	
	const scrollPosition = window.scrollY;
	const viewportHeight = window.innerHeight;
	const threshold = viewportHeight * 0.3; // Show when scrolled 30% of viewport
	
	if (scrollPosition > threshold) {
		showProjectsPreview();
		// Remove the scroll listener once shown to prevent repeated calls
		window.removeEventListener('scroll', handleScrollForPreview);
	}
}

// Update navigation active state
function updateNavState(sectionId) {
	const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
	navLinks.forEach(link => {
		if (link.dataset.section === sectionId) {
			link.classList.add('active');
		} else {
			link.classList.remove('active');
		}
	});
}

// Mobile menu toggle
function toggleMobileMenu() {
	const mobileMenuBtn = document.getElementById('mobile-menu-btn');
	const mobileNav = document.getElementById('mobile-nav');
	
	mobileMenuBtn.classList.toggle('active');
	mobileNav.classList.toggle('active');
}

function closeMobileMenu() {
	const mobileMenuBtn = document.getElementById('mobile-menu-btn');
	const mobileNav = document.getElementById('mobile-nav');
	
	mobileMenuBtn.classList.remove('active');
	mobileNav.classList.remove('active');
}

// Project Filtering Functions
function filterProjects() {
	const projectCards = document.querySelectorAll('#projects-grid .project-card-link');
	let visibleCount = 0;
	
	// First sort the projects
	sortProjects(activeFilters.sort);
	
	projectCards.forEach(card => {
		const status = card.dataset.status;
		const area = card.dataset.area;
		const tech = card.dataset.tech;
		
		// Check status filter
		const statusMatch = activeFilters.status.includes('all') || activeFilters.status.includes(status);
		
		// Check area filter
		const areaMatch = activeFilters.area.length === 0 || 
						activeFilters.area.includes(area);

		// Check tech filter (if no tech filters selected, show all)
		const techMatch = activeFilters.tech.length === 0 || 
						activeFilters.tech.some(filterTech => 
							tech && tech.toLowerCase().includes(filterTech.toLowerCase())
						);
		
		// Show or hide card
		if (statusMatch && areaMatch && techMatch) {
			card.classList.remove('hidden', 'fade-out');
			visibleCount++;
		} else {
			card.classList.add('fade-out');
			setTimeout(() => {
				card.classList.add('hidden');
			}, 300);
		}
	});
	
	// Update counter
	updateProjectCounter(visibleCount, projectCards.length);
	
	// Regenerate filters to update counts (but preserve current selections)
	setTimeout(() => {
		regenerateFiltersWithSelections();
	}, 350); // Wait for fade animation to complete
	
	// Update URL with current filters
	if (document.getElementById('projects').classList.contains('active')) {
		updateURL('projects', true);
	}
}

function updateProjectCounter(visible, total) {
	const visibleCountEl = document.getElementById('visible-count');
	const totalCountEl = document.getElementById('total-count');
	
	if (visibleCountEl && totalCountEl) {
		visibleCountEl.textContent = visible;
		totalCountEl.textContent = total;
	}
}

function sortProjects(sortBy) {
	const grid = document.getElementById('projects-grid');
	const cards = Array.from(grid.children);
	
	cards.sort((a, b) => {
		switch(sortBy) {
			case 'name-asc':
				return a.dataset.name.localeCompare(b.dataset.name);
			case 'name-desc':
				return b.dataset.name.localeCompare(a.dataset.name);
			case 'status':
				const statusOrder = { 'completed': 1, 'in-progress': 2, 'planned': 3 };
				return statusOrder[a.dataset.status] - statusOrder[b.dataset.status];
			default:
				return 0; // Keep original order
		}
	});
	
	// Re-append cards in new order
	cards.forEach(card => grid.appendChild(card));
}

// Convert current filters to URL query parameters
function serializeFiltersToURL() {
	const params = new URLSearchParams();
	
	// Add status (skip if 'all')
	if (activeFilters.status.length > 0 && !activeFilters.status.includes('all')) {
		params.set('status', activeFilters.status.join(','));
	}
	
	// Add areas
	if (activeFilters.area.length > 0) {
		params.set('area', activeFilters.area.join(','));
	}
	
	// Add tech
	if (activeFilters.tech.length > 0) {
		params.set('tech', activeFilters.tech.join(','));
	}
	
	// Add sort (skip if default)
	if (activeFilters.sort !== 'default') {
		params.set('sort', activeFilters.sort);
	}
	
	return params.toString();
}

// Parse URL parameters back into filter objects
function parseFiltersFromURL() {
	const urlParams = new URLSearchParams(window.location.search);
	
	const filters = {
		status: ['all'],
		area: [],
		tech: [],
		sort: 'default'
	};
	
	// Parse status
	if (urlParams.has('status')) {
		filters.status = urlParams.get('status').split(',');
	}
	
	// Parse areas
	if (urlParams.has('area')) {
		filters.area = urlParams.get('area').split(',');
	}
	
	// Parse tech
	if (urlParams.has('tech')) {
		filters.tech = urlParams.get('tech').split(',');
	}
	
	// Parse sort
	if (urlParams.has('sort')) {
		filters.sort = urlParams.get('sort');
	}
	
	return filters;
}

// Handle form submission
function handleSubmit(event) {
	event.preventDefault();
	
	// Get form values
	const name = document.getElementById('name').value;
	const email = document.getElementById('email').value;
	const message = document.getElementById('message').value;
	
	// Here you would normally send the form data to a server
	// For now, we'll just show an alert
	alert(`Thank you for your message, ${name}! I'll get back to you at ${email} soon.`);
	
	// Clear form
	document.getElementById('name').value = '';
	document.getElementById('email').value = '';
	document.getElementById('message').value = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
	// Add loading class to prevent scrollbars
	document.body.classList.add('loading');
	
	// Set up navigation click handlers FIRST
	const navLinks = document.querySelectorAll('[data-section]');
	navLinks.forEach(link => {
		link.addEventListener('click', function(e) {
			e.preventDefault();
			const sectionId = this.dataset.section;
			showSection(sectionId);
		});
	});
	
	// Logo click handler
	document.querySelector('.logo').addEventListener('click', function() {
		showSection('home');
	});
	
	// Rotating tagline functionality
	function initRotatingTagline() {
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

	// Initialize rotating tagline for home section
	initRotatingTagline();

	// Initialize seamless scrolling for about section
	initSeamlessScroll();
	
	// Initialize seamless scrolling for about section
	initSeamlessScroll();

	// Mobile menu button
	document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);

	// Footer navigation links
	const footerLinks = document.querySelectorAll('.footer-links [data-section]');
	footerLinks.forEach(link => {
		link.addEventListener('click', function(e) {
			e.preventDefault();
			const sectionId = this.dataset.section;
			showSection(sectionId);
		});
	});

	// Generate dynamic filters based on project data (EXISTING CODE CONTINUES)
	generateDynamicFilters();

	// Generate dynamic filters based on project data
	generateDynamicFilters();

	// Prevent sidebar from closing when clicking inside it
	document.getElementById('filter-sidebar').addEventListener('click', function(e) {
		e.stopPropagation();
	});

	// Initialize project counter
	const totalProjects = document.querySelectorAll('#projects-grid .project-card').length;
	updateProjectCounter(totalProjects, totalProjects);
	
	// Populate projects preview on home page
	populateProjectsPreview();

	// Determine initial section
	const hash = window.location.hash.substring(1);
	const initialSection = (hash && document.getElementById(hash)) ? hash : 'home';

	// If initial section is projects, parse and apply filters
	if (initialSection === 'projects') {
		activeFilters = parseFiltersFromURL();
	}

	// Hide loader and show initial section with proper animation timing
	setTimeout(() => {
		// Hide the loader
		document.getElementById('loader').classList.add('hidden');
		document.body.classList.remove('loading');
		
		// Hide all sections first (including the default home section)
		const allSections = document.querySelectorAll('.section');
		allSections.forEach(section => {
			section.classList.remove('active');
		});

		// Set the initial section as active
		// Set the initial section as active
		const targetSection = document.getElementById(initialSection);
		if (targetSection) {
			targetSection.classList.add('active');
			updateNavState(initialSection);
			
			// If it's the projects section, apply filters from URL
			if (initialSection === 'projects') {
				// Give the DOM time to render the section, then apply filters
				setTimeout(() => {
					applyFiltersFromState();
				}, 200);
			}
			
			// If it's the home section, trigger animations after it's fully rendered
			if (initialSection === 'home') {
				// Give the browser time to render the active section
				setTimeout(triggerHeroAnimations, 200);
				// Add scroll listener to show projects preview
				window.addEventListener('scroll', handleScrollForPreview);
			}
		}
	}, 500);

	// Handle browser back/forward buttons
	// Handle browser back/forward buttons
	window.addEventListener('hashchange', function() {
		const hash = window.location.hash.substring(1);
		const sectionId = hash || 'home';
		
		// Only change section if it exists and isn't already active
		if (document.getElementById(sectionId) && !document.getElementById(sectionId).classList.contains('active')) {
			showSectionFromURL(sectionId);
		}
	});
});

// Initialize seamless scrolling for auto-scroll sections
function initSeamlessScroll() {
    const wrappers = document.querySelectorAll('.auto-cards-wrapper');
    
    wrappers.forEach(wrapper => {
        const cards = wrapper.querySelectorAll('.auto-card');
        const clonedCards = [];
        
        // Clone each card and append to create seamless loop
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clonedCards.push(clone);
        });
        
        // Append cloned cards to wrapper
        clonedCards.forEach(clone => {
            wrapper.appendChild(clone);
        });
    });
}

// Handle browser navigation and apply URL filters
function showSectionFromURL(sectionId) {
	// Hide all sections first
	const sections = document.querySelectorAll('.section');
	sections.forEach(section => {
		section.classList.remove('active');
	});

	// Hide projects preview when leaving home section
	if (sectionId !== 'home') {
		hideProjectsPreview();
		window.removeEventListener('scroll', handleScrollForPreview);
	}

	// Show the selected section
	const targetSection = document.getElementById(sectionId);
	if (targetSection) {
		setTimeout(() => {
			targetSection.classList.add('active');
		}, 50);
	}

	// Apply filters if navigating to projects
	if (sectionId === 'projects') {
		const urlFilters = parseFiltersFromURL();
		activeFilters = urlFilters;
		
		// Wait for section to be active, then apply filters
		setTimeout(() => {
			if (document.getElementById('projects').classList.contains('active')) {
				applyFiltersFromState();
			}
		}, 100);
	}

	// Trigger hero animations when showing home section
	if (sectionId === 'home') {
		setTimeout(triggerHeroAnimations, 100);
		window.addEventListener('scroll', handleScrollForPreview);
	}

	// Update active nav state
	updateNavState(sectionId);

	// Close mobile menu and filter sidebar if open
	closeMobileMenu();

	// Scroll to top
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
	if (e.key === 'Escape') {
		closeMobileMenu();
		if (document.getElementById('filter-sidebar').classList.contains('active')) {
			toggleFilterSidebar();
		}
	}
});