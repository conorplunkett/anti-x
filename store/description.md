# Chrome Web Store Listing — Anti-Timeline

## Name
Anti-Timeline - X Feed Blocker

## Summary (132 chars max)
Blocks the Home timeline, For You feed, Trends, and suggestions on Twitter/X while keeping posting, search, DMs, and more working.

## Description
Anti-Timeline blocks the distracting parts of Twitter/X so you can use it intentionally.

It hides the Home timeline, For You feed, Trends, suggested accounts, suggested posts, Explore, and other recommendation surfaces while keeping useful workflows like posting, search, DMs, notifications, bookmarks, lists, profiles, and direct tweet links.

No tracking. No analytics. No account. No remote server. Settings stay on your device.

Features:
• Block Home timeline and For You feed (optionally allow the Following feed)
• Hide Trends, Explore, suggested accounts, and suggested posts
• Hide "More posts" under direct tweet pages
• Simple popup with toggles — changes apply instantly
• Only one permission: storage

## Category
Productivity → Workflow & Planning

## Listing checklist
- [ ] Screenshots (1280×800): blocked home screen, popup toggles, a clean tweet page
- [ ] Small promo tile 440×280 (optional)
- [ ] Privacy policy URL (host `store/privacy.md` content, e.g. GitHub Pages or repo link)
- [ ] Single purpose description: "Hides distracting feed/recommendation surfaces on x.com and twitter.com"
- [ ] Permission justification — storage: "Saves the user's blocking preferences locally"
- [ ] Data usage disclosure: collects no user data

## Packaging
```sh
cd source && zip -r ../anti-timeline.zip . -x '.*'
```
Upload `anti-timeline.zip` at https://chrome.google.com/webstore/devconsole
