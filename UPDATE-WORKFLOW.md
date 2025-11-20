# Website Update Workflow

Quick reference for updating and optimizing your BLOT.WORLD site.

---

## 🚀 Complete Update & Deploy Workflow

```bash
# 1. Make your changes (edit HTML, CSS, JS, add images, etc.)

# 2. If you added new photos to projects/photography/images/:
cd projects/photography
python generate_metadata.py
cd ../..

# 3. Run the complete optimization build
npm run build

# 4. Test locally
npm run serve
# Visit http://localhost:8080 and verify everything works

# 5. Commit and push
git add -A
git commit -m "Your commit message"
git push
```

---

## 📝 Individual Commands (if needed)

### Optimize Images Only
```bash
npm run optimize:images
```
Creates WebP versions + optimizes JPG/PNG for:
- Main site images (`images/`)
- Photography gallery (`projects/photography/images/`)

### Minify CSS Only
```bash
npm run minify:css
```
Creates `.min.css` versions of all stylesheets

### Minify JavaScript Only
```bash
npm run minify:js
```
Creates `.min.js` versions of all scripts

---

## 📸 Adding New Photos

```bash
# 1. Add images to projects/photography/images/

# 2. Generate metadata (auto-extracts EXIF data)
cd projects/photography
python generate_metadata.py

# 3. Return to root and build
cd ../..
npm run build

# Done! Metadata extracted, images optimized, WebP created
```

---

## ✅ What Gets Optimized

**Images:**
- ✓ WebP versions created (70-90% smaller)
- ✓ Original JPG/PNG optimized
- ✓ Automatic fallback support

**CSS:**
- ✓ Minified versions (28% smaller)
- ✓ Source files preserved

**JavaScript:**
- ✓ Minified versions (49% smaller)
- ✓ Source files preserved

---

## 🔧 Troubleshooting

**Photos not loading?**
```bash
cd projects/photography
python generate_metadata.py
```

**Minified files not being used?**
- Clear browser cache (Ctrl+Shift+R)
- Check HTML references `.min.css` and `.min.js`

**Images not optimized?**
```bash
npm run optimize:images
```

---

## 💡 Pro Tips

1. **Always run `npm run build` before deploying**
2. **Test locally first** with `npm run serve`
3. **Photography updates**: Just add images → run `generate_metadata.py` → run `npm run build`
4. **CSS/JS edits**: Edit source files (.css, .js) then run build to regenerate minified versions

---

## 📊 Expected Results

After running `npm run build`:
- Total page weight: ~8-10 MB (down from ~50 MB)
- CSS: 28% smaller
- JS: 49% smaller
- Images: 91% smaller with WebP
- Photography loads automatically with metadata
- Everything works on static hosting (no server needed)
