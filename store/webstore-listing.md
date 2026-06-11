# Chrome Web Store Listing — copy/paste guide

Everything below is paste-ready for the [developer console](https://chrome.google.com/webstore/devconsole).
Each section maps to a field in the "Store listing", "Privacy", and "Distribution" tabs.

---

## Store listing tab

### Name (45 chars max)

```
Anti-Timeline: X Feed Blocker
```

### Summary (132 chars max)

```
Blocks the Home timeline, For You feed, Trends & suggestions on Twitter/X — while posting, search, DMs and more keep working.
```

### Description

```
Open X. Skip the feed.

Anti-Timeline removes the addictive parts of Twitter/X so you can use it intentionally — as a tool, not a slot machine.

WHAT IT BLOCKS
• Home timeline — no more landing on an infinite feed
• "For You" feed — the algorithmic rabbit hole is gone (optionally keep "Following")
• Trends and "What's happening"
• The Explore page and its nav link
• "Who to follow" and other suggested accounts
• Suggested and promoted posts injected into feeds
• "Discover more" posts under tweet links

WHAT KEEPS WORKING
• Posting
• Search
• Direct messages
• Notifications
• Bookmarks
• Lists
• Profile pages
• Direct tweet links

Instead of the feed, you see a calm blocked screen with shortcuts to the things you actually came for. Every blocker has a toggle in the popup, and changes apply instantly — no page reload.

PRIVACY, BY ARCHITECTURE
No tracking. No analytics. No account. No remote server. The extension requests a single permission (storage), makes zero network requests, and keeps your settings in your browser's local storage. The full source code is public on GitHub.

FREE, FOREVER
The complete blocker is free — not a trial, not a teaser. An optional Pro tier with habit tools (scheduled blocking, a daily feed budget, a breathing-room countdown, custom blocked-screen messages, and on-device focus stats) is coming soon, and stays just as private.

Use X. Don't let X use you.

Not affiliated with X Corp.
```

### Category

`Productivity` → `Workflow & Planning`

### Language

`English`

### Graphic assets

| Asset | Spec | Suggestion |
|---|---|---|
| Store icon | 128×128 PNG | `source/public/at128.png` (replace with final art before launch) |
| Screenshots (1–5) | 1280×800 or 640×400 | 1. Blocked home screen on x.com 2. Popup with toggles 3. A clean tweet page (no "Discover more") 4. Hidden trends sidebar before/after |
| Small promo tile (optional) | 440×280 | Dark background, "Open X. Skip the feed." headline |

---

## Privacy tab

### Single purpose description

```
Hides distracting feed and recommendation surfaces (Home timeline, For You feed, Trends, Explore, suggested accounts and posts) on x.com and twitter.com, replacing the blocked feed with a screen of shortcuts to intentional features.
```

### Permission justifications

**storage:**

```
Saves the user's blocking preferences (e.g. "Block Home timeline: on/off") locally in the browser so they persist between sessions. No data leaves the device.
```

**Host permissions (x.com, twitter.com):**

```
The content script must run on x.com and twitter.com pages to hide feed and recommendation elements there. It does not read, collect, or transmit any page content.
```

### Data usage disclosures

Check **none** of the data-collection categories. The extension collects no data of any kind.

- "Does your extension collect or use any user data?" → **No**

### Privacy policy URL

Host `store/privacy.md` somewhere public and paste its URL, e.g.:

```
https://github.com/conorplunkett/anti-x/blob/main/store/privacy.md
```

---

## Distribution tab

- Visibility: **Public**
- Distribution: all regions
- Pricing: **Free**

---

## Packaging & submission

```sh
cd source && zip -r ../anti-timeline.zip . -x '.*'
```

1. Pay the one-time $5 developer registration fee (if you haven't).
2. Developer console → **New item** → upload `anti-timeline.zip`.
3. Fill in the fields above, upload screenshots, submit for review.
4. Review typically takes a few business days for a first submission.

### Pre-submission checklist

- [ ] Final icons (replace generated placeholders in `source/public/`)
- [ ] 1280×800 screenshots taken on a real x.com session
- [ ] Privacy policy hosted at a public URL
- [ ] Version in `manifest.json` is correct
- [ ] Donation URL in `source/modules/lib.js` points to your real page
- [ ] Manual QA checklist in the repo README passes on x.com and twitter.com
