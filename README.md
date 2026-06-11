# Anti-Timeline — X Feed Blocker

A lightweight Manifest V3 Chrome extension that blocks the addictive parts of
Twitter/X (Home timeline, For You feed, Trends, Explore, suggestions) while
keeping the useful parts working: posting, search, DMs, notifications,
bookmarks, lists, profiles, and direct tweet links.

Inspired by [Antigram](https://github.com/aymyo/antigram-extension), but for X.

No tracking. No analytics. No remote server. Settings stay on your device.

## Install locally (for testing)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `source/` folder of this repo.
4. Visit `x.com` — the Home timeline should be replaced by a blocked screen.
5. Click the Anti-Timeline toolbar icon to adjust toggles (changes apply live).

## Pro features (scaffolded, no payment wired up)

The popup has a Pro section gated behind an `isPro` flag. To unlock it for
testing, run this in DevTools on any x.com tab (or the popup's inspect view):

```js
chrome.storage.local.set({ isPro: true })
```

Implemented: custom blocked-screen message, local focus stats, scheduled
blocking, daily feed budget, and a breathing-room countdown. Keyword muting is
still a stub. Everything stays in `chrome.storage.local` — no payment provider
or network calls are wired up yet (see the TODO in `source/popup/popup.js`).

## Manual QA checklist (PRD acceptance criteria)

- [ ] Extension installs locally without errors
- [ ] Popup opens; toggles save and persist after browser restart
- [ ] `x.com/home` is blocked by default (blocked screen with shortcuts)
- [ ] For You is blocked by default; "Allow Following" toggle works
- [ ] Trends and suggested accounts/posts are hidden by default
- [ ] `/explore` is blocked; Explore nav link hidden
- [ ] DMs (`/messages`) work untouched
- [ ] Notifications work untouched
- [ ] Search works; trends modules on search pages hidden
- [ ] Direct tweet links work; "Discover more" below tweets hidden
- [ ] Bookmarks (`/i/bookmarks`) and Lists work untouched
- [ ] Profile pages and posting (`/compose/post`) work
- [ ] DevTools Network tab shows no requests originating from the extension

## Project structure

```
source/
├── manifest.json            # MV3 manifest — storage permission only
├── content.js               # loader: dynamic import of modules/main.js
├── content.css              # blocked-screen styling
├── modules/
│   ├── lib.js               # settings model, selector map, helpers
│   ├── main.js              # route detection + MutationObserver logic
│   └── blocked-screen.js    # "Timeline blocked" replacement UI
├── popup/                   # toolbar popup / options page (auto-saving toggles)
└── public/                  # icons (16/32/48/128) — placeholders, replaceable
store/
├── webstore-listing.md      # paste-ready Chrome Web Store listing + checklist
└── privacy.md               # privacy policy (no data collection)
site/                        # Next.js landing page (npm run dev)
```

## Landing page

A local landing page (one-sec.app style) lives in `site/`:

```sh
cd site && npm install && npm run dev
```

Then open http://localhost:3000. Main content is in `site/app/page.tsx`,
styles in `site/app/globals.css`.

## How it works

X is a single-page React app with obfuscated class names, so the content script
uses a `MutationObserver` plus stable `data-testid` / `aria-label` / header-text
hooks (all centralized in `source/modules/lib.js`) to detect routes and hide or
replace elements. Settings live in `chrome.storage.local` and apply instantly
via `chrome.storage.onChanged`.

> **Note:** X changes its DOM frequently. If a surface stops being hidden,
> the fix is usually a one-line selector update in `source/modules/lib.js`.

## Publish to the Chrome Web Store

```sh
cd source && zip -r ../anti-timeline.zip . -x '.*'
```

Then upload `anti-timeline.zip` at the
[developer console](https://chrome.google.com/webstore/devconsole). See
`store/webstore-listing.md` for paste-ready listing copy and the submission
checklist.

## License

MIT — see [LICENSE](LICENSE).
