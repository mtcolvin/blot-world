# About Section Implementation Guide

## Files Created
1. `about-section.html` - The HTML markup for the About section
2. `about-section.css` - The CSS styles for the About section

## Installation Steps

### Step 1: Add the HTML

Open your `index.html` file and add the About section content between the Projects section and the footer. The structure should be:

```html
<!-- Projects Section -->
<section id="projects" class="section">
    ...existing projects code...
</section>

<!-- INSERT ABOUT SECTION HERE -->
<!-- Copy the entire contents of about-section.html here -->

<!-- Global Footer -->
<footer class="global-footer">
    ...existing footer code...
</footer>
```

### Step 2: Add the CSS

You have two options:

**Option A: Add to components.css (Recommended)**
- Open `css/components.css`
- Scroll to the bottom
- Copy and paste all the contents of `about-section.css`

**Option B: Create a new CSS file**
- Save `about-section.css` as `css/about.css`
- Add this line to your `index.html` in the `<head>` section:
  ```html
  <link rel="stylesheet" href="css/about.css">
  ```

### Step 3: Add Your Photo

1. Place your full-body photo in the `images/` folder
2. Name it `full-body-photo.jpg` (or update the HTML to match your filename)
3. Recommended image specs:
   - Width: 800-1200px
   - Format: JPG or PNG
   - Aspect ratio: Portrait orientation

### Step 4: Add Your Resume

1. Create a `documents/` folder in your project root (if it doesn't exist)
2. Place your resume PDF there as `matthew-colvin-resume.pdf`
3. Or update the button's `onclick` path to match your file location

### Step 5: Customize Content

Edit the text content in `about-section.html`:

**Bio Text:**
- Replace the placeholder paragraphs with your actual bio
- Keep it conversational and authentic

**Values:**
- Customize the 4 value items (or add/remove as needed)
- Each value has an icon, title, and description

**Skills:**
- Update the 4 skill categories with your actual skills
- Add or remove items from each list
- Reorder categories as you prefer

**Icons:**
- The value icons use the `✦` character (you can replace with any emoji or symbol)
- Consider: ✦ ★ ◆ ● ▲ ✓ → or any emoji

## Navigation Setup

Make sure the About link in your navigation points to `#about`:

```html
<li><a data-section="about">About</a></li>
```

The existing JavaScript in your `script.js` should already handle the section navigation.

## Layout Overview

The About section uses this structure:

```
┌─────────────────────────────────────┐
│         Section Header              │
├──────────────┬──────────────────────┤
│              │                      │
│    Photo     │    Bio Text          │
│  (Sticky)    │                      │
│              │    Values Grid       │
│              │    (2x2)             │
└──────────────┴──────────────────────┘
┌─────────────────────────────────────┐
│    Skills Grid (4 columns)          │
├─────────────────────────────────────┤
│    Resume Download Section          │
└─────────────────────────────────────┘
```

**Key Features:**
- Photo sticks on scroll (desktop only)
- Gradient accent lines match your brand
- Hover effects on value and skill cards
- Fully responsive design
- Clean, minimal aesthetic matching your site

## Responsive Behavior

- **Desktop (>1024px):** Side-by-side layout, photo sticks
- **Tablet (768-1024px):** Side-by-side, narrower photo
- **Mobile (<768px):** Stacked layout, all single column

## Color Variables Used

The section uses your existing CSS variables:
- `--dark-gray` - Card backgrounds
- `--gray` - Borders
- `--light-gray` - Text
- `--white` - Headings
- `--primary-blue` - Accents
- `--accent-red` - Accents

## Customization Tips

1. **Change grid layouts:** Adjust `grid-template-columns` in `.values-grid` or `.skills-grid`
2. **Add more values:** Copy a `.value-item` div and edit the content
3. **Change photo size:** Adjust the `400px` width in `.about-grid`
4. **Remove sticky photo:** Delete `position: sticky` from `.about-photo-container`
5. **Change accent colors:** Update the gradient colors in `::before` and `::after` elements

## Preview & Testing

1. Save all files
2. Refresh your browser
3. Click "About" in the navigation
4. Test responsive design by resizing browser window
5. Verify all links and buttons work

## Need Help?

If something doesn't look right:
1. Check browser console for errors (F12)
2. Verify all CSS variables are defined in `base.css`
3. Make sure the section ID matches navigation: `id="about"`
4. Confirm image and document paths are correct

---

**Version:** 1.0  
**Created:** 2025  
**Style:** Matches BLOT.WORLD design system
