# Foldtype website

A static site for `foldleafreader/foldtype`, adapted from the local `foldleafreader/foldleaf` template. No build tools or package installation required.

## Design

Retains the Foldleaf template's sticky navigation, centred product hero, large screenshot sections, scroll-linked statement, horizontal galleries, reveal transitions, and Support / Privacy / Press layouts. `style.css` and `home.css` are retained from Foldleaf; `foldtype.css` adds warm paper, dark ink, a red accent, serif headlines and typewriter details.

The temporary monogram is **not** the supplied Foldtype logo. The supplied logo and JPG graphics could not yet be downloaded into the checkout. Import the final branding before treating the branding pass as complete.

## Preview

Open `index.html` directly, or use a local server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Content and media

`content.js` centralises the main marketing copy, App Store URL, support email, logo, screenshots and video paths. The draft contains no fabricated reviews, pricing, release dates, or final app privacy claims. Support, Privacy and Press intentionally have pending content.

| Replace | Configuration |
| --- | --- |
| Temporary monogram | `logo` |
| Hero illustration | `hero.src`, `hero.poster`, `hero.alt` |
| Animation placeholder | `animation.src`, `animation.poster` |
| Main screenshot illustration | `screenshots.writing` |
| Gallery placeholders | `screenshots.galleryOne`, `galleryTwo`, `galleryThree` |
| iPhone Duo showcase | `screenshots.duo` |
| Download links | `appStoreUrl` — exact `https://apps.apple.com/...` URL |
| Support and press contact | `supportEmail` |
| Main copy | `copy` |

Place approved media in `images/` with simple lowercase filenames. Paths must be relative, such as `images/foldtype-writing.webp`; leading `/` breaks deployment under the GitHub Pages project path. MP4 and WebM videos are supported in the hero and animation slots, with playback controls, no autoplay, and no eager video downloads.

When replacing media, update placeholder captions and associated introductory text. Add the approved app privacy policy to `privacy.html`, update the FAQs in `support.html`, and complete the fact sheet and downloads in `press.html`. Update the favicon and social preview metadata when the real logo and graphics are imported. Headings accept trusted HTML from this configuration; do not populate it with untrusted user input.

## Deploy on GitHub Pages

The workflow at `.github/workflows/pages.yml` publishes only the site's HTML, CSS, JavaScript and `images/` directory. It does not publish repository documentation.

1. Push this checkout's `main` branch to `https://github.com/foldleafreader/foldtype.git`.
2. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Check **Actions → Deploy Foldtype to GitHub Pages**. If needed, run it manually from that workflow's page after enabling Pages.

The default URL is expected to be `https://foldleafreader.github.io/foldtype/`, subject to repository and custom-domain settings. Deployment has not been verified.

## Verification

Before launch, visually check desktop and narrow mobile layouts, navigation, gallery controls, support disclosures, reduced-motion behaviour, and final media. Browser QA was unavailable in the restricted creation session. HTML local links, asset references, JavaScript syntax and template retention were checked locally.
