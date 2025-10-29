# Quick Reference Card

## 🎯 File Locations

| File | Purpose | Size |
|------|---------|------|
| `index.html` | Main HTML structure | 28KB |
| `css/main.css` | All styles (organized) | 30KB |
| `js/main.js` | All JavaScript (modular) | 19KB |

## 🔑 Key Functions

### Navigation
```javascript
Navigation.showSection('sectionId')  // Navigate to section
Navigation.updateURL('sectionId')    // Update browser URL
```

### Filters
```javascript
FilterSystem.applyFilters()          // Apply current filters
FilterSystem.clearAll()              // Reset all filters
```

### Hero
```javascript
HeroAnimations.trigger()             // Trigger hero animations
```

## 🎨 CSS Variables

```css
/* Colors */
--black: #000000
--white: #ffffff
--primary-blue: #0D28F2
--accent-red: #E60F0F
--gray: #2a2a2a

/* Sizes */
--nav-height: 65px
--headshot-size: 170px
```

## 📱 Breakpoints

```css
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 480px)  { /* Small Mobile */ }
```

## 🔧 Common Tasks

### Add a Project
```html
<div class="project-card" 
     data-area="Category"
     data-tech="Tech1,Tech2"
     data-name="Project Name">
  <!-- Project content -->
</div>
```

### Change Theme Colors
Edit `:root` in `main.css`:
```css
:root {
  --primary-blue: #YOUR_COLOR;
  --accent-red: #YOUR_COLOR;
}
```

## 📊 Module Structure

```
AppState
├── activeFilters
└── currentSection

Navigation
├── showSection()
├── updateURL()
└── updateNavState()

FilterSystem
├── applyFilters()
├── clearAll()
└── updateCounter()
```

## 🎯 Data Attributes Required

```html
data-section="sectionId"   <!-- For navigation -->
data-area="Category"       <!-- For filtering -->
data-tech="Tech1,Tech2"    <!-- For tech filters -->
data-name="Project Name"   <!-- For sorting -->
```

## 🚀 Quick Start

1. Copy your images to `images/` folder
2. Update projects in `index.html`
3. Customize colors in `main.css`
4. Test in browser
5. Deploy!

## 🔍 Debugging

```javascript
console.log(AppState.activeFilters);  // Current filters
console.log(AppState.currentSection); // Current section
```

---

**Keep this card handy for quick reference!**
