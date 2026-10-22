# Foldtype website

Static GitHub Pages website for `foldleafreader/foldtype`, using the Foldleaf template's shared header, paper/ink styling, reveal transitions and document pages.

## Home page

The homepage is deliberately limited to this sequence:

1. Existing header.
2. Foldtype.
3. A typewriter in your pocket. / Available Oct. 2026 on Apple App Store.
4. Mint typewriter animation, controlled by scrolling.
5. No Copy. No Paste. No Distractions. Then, after a gap: Unfold your thoughts.
6. Black typewriter animation, controlled by scrolling.
7. The supplied Ernest Hemingway quotation.
8. Also available on iPhone and iPad.
9. iPad animation, controlled by scrolling.
10. Unlock Apple Pencil annotations and highlights.
11. Coming soon: Foldtype Penpals.
12. Supplied Foldtype banner.

No extra homepage feature cards, galleries, FAQ, illustrations or footer. Support, Privacy and Press files remain available for the existing navigation and future content. The app's final privacy policy and contact details are still pending.

Edit homepage copy and media paths directly in `index.html`. `content.js` holds shared logo, contact and App Store configuration. `scroll.css` contains the homepage layout; `style.css`, `home.css` and `foldtype.css` retain shared template/document styling.

The paper background keeps the original colour with a small tiled grain overlay. Special Elite provides the worn typewriter headings; Courier Prime provides readable body and navigation text. Both fonts are served locally from `images/fonts/` with their licences. The iPhone/iPad availability heading is smaller than the main statements.

## Scroll animation

`site.js` maps each pinned video section's scroll progress to the video timeline through `scroll-video.js`. Scrolling back reverses it. Only videos approaching the viewport are asked to preload. The controller initializes decoding with a brief muted play/pause, waits for decoded data, keeps the latest scroll target during a seek, and retries or reloads once if a seek stalls. If the browser requires a gesture, an **Enable animation** button unlocks the scroll timeline. Recovery timers stop when the target is displayed or the section leaves the viewport. Frame updates run on animation frames requested by scrolling, resizing, media readiness or page restoration, rather than an idle animation loop.

Text fades from light ink to full ink word by word, with subtle scale/fade transitions for the video frames. Each clip also offers a **Play video** control to switch to normal playback. Returning to **Use scroll animation** restores the current scroll position on the video timeline.

Reduced motion, data-saving mode and browsers without IntersectionObserver use regular click-to-play videos with short page sections. Without JavaScript, the page stays visible and the videos keep their native controls. Hidden or offscreen videos are paused.

## Media

Web copies are in `media/`, with poster images in `images/`. Originals in the desktop Blender folder were left unchanged.

| Source | Web asset | Duration | Resolution | Size |
| --- | --- | --- | --- | --- |
| Foldtype-mint-pullback.mp4 | mint-typewriter.mp4 | 18 s | 1280×720, 30 fps | 2.95 MB |
| Foldtype-new-clips-transition-test.mp4 | black-typewriter.mp4 | 10 s | 1280×720, 30 fps | 1.37 MB |
| Foldtype-iPad-promo-lit.mp4 | ipad-typewriter-hd.mp4 | 10 s | 1920×1080, 30 fps | 3.55 MB |

Total: approximately 7.9 MB (decimal). H.264, frequent keyframes (0.4 seconds), no B-frames, muted/silent video and fast-start metadata support timeline seeking. Scroll copies omit audio because scrubbing is silent. All frames, full durations and source resolutions are retained. The iPad clip and poster use the finished, correctly lit full-HD promo edit.

The supplied F. logo and clean typewriter banner are used directly, with WebP variants, PNG favicons and original JPG downloads/social preview artwork. Source graphics are unchanged.

## Preview

Open `index.html` directly, or run `python3 -m http.server 8000` from this checkout and visit `http://localhost:8000`.

## Deployment

`.github/workflows/pages.yml` publishes the HTML, CSS, JavaScript, `images/` and `media/` directories. Push `main`, select **GitHub Actions** in repository **Settings → Pages**, and check the workflow result. The expected URL is `https://foldleafreader.github.io/foldtype/`, subject to repository settings.

## Verification

Static validation covers the requested content order, unchanged header, local links and assets, JavaScript syntax, deploy-file inclusion, video durations/codecs/keyframe spacing and full video decoding. Browser visual and mobile playback QA could not run in the restricted creation session. Check scroll seeking on desktop and iPhone Safari, normal playback, reduced motion and iPad image quality before launch.

Controller regression tests cover delayed readiness, decoder startup, rapid changes in scroll direction, missing/stalled seek events (including buffering), bounded reload recovery, gesture blocking and manual playback. Run with `node tests/scroll-video.test.js`; the tests also run in a standalone JavaScript engine without browser or network access.
