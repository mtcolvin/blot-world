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