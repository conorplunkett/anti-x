import {
  defaultSettings,
  selectors,
  urls,
  moduleHeaderTexts,
  hide,
  unhideAll,
  loadSettings,
} from "./lib.js";
import { buildBlockedScreen, BLOCKED_SCREEN_ID } from "./blocked-screen.js";

let settings = { ...defaultSettings };

const textMatches = (el, needles) => {
  const text = (el?.textContent || "").trim().toLowerCase();
  return needles.some((n) => text.includes(n));
};

const removeBlockedScreen = () => {
  document.getElementById(BLOCKED_SCREEN_ID)?.remove();
};

// Hide the timeline region inside the primary column and show the blocked
// screen in its place. Keeps the page header (and home tab bar) visible.
const blockTimeline = (title) => {
  const column = document.querySelector(selectors.primaryColumn);
  if (!column) return;

  const region =
    column.querySelector('div[aria-label*="timeline" i]') ||
    column.querySelector("section[role='region']");
  hide(region);

  if (!document.getElementById(BLOCKED_SCREEN_ID)) {
    const anchor = region?.parentElement || column;
    anchor.appendChild(buildBlockedScreen(title));
  }
};

const activeHomeTab = () => {
  const tab = document.querySelector(
    `${selectors.tabList} ${selectors.tab}[aria-selected="true"]`
  );
  return (tab?.textContent || "").trim().toLowerCase();
};

const handleHome = () => {
  const tab = activeHomeTab();
  const onFollowing = tab.includes("following");

  // Hide the "For You" tab itself when For You is blocked but Following is allowed.
  if (settings.blockForYou && settings.allowFollowing) {
    document.querySelectorAll(`${selectors.tabList} ${selectors.tab}`).forEach((t) => {
      if (textMatches(t, ["for you"])) hide(t);
    });
  }

  const allowThisTab = settings.allowFollowing && onFollowing;
  const shouldBlock =
    (settings.blockHomeTimeline || settings.blockForYou) && !allowThisTab;

  if (shouldBlock) {
    blockTimeline("Timeline blocked");
  } else {
    removeBlockedScreen();
  }
};

const handleExplore = () => {
  if (settings.hideExplore) blockTimeline("Explore blocked");
};

// Hide "Discover more" / "More posts" under a tweet: the header cell and
// every timeline cell after it.
const handleStatusPage = () => {
  if (!settings.hideMorePosts) return;
  const headers = document.querySelectorAll(`${selectors.primaryColumn} h2`);
  for (const h of headers) {
    if (!textMatches(h, moduleHeaderTexts.morePosts)) continue;
    let cell = h.closest(selectors.cell);
    while (cell) {
      hide(cell);
      cell = cell.nextElementSibling;
    }
  }
};

// Hide recommendation modules embedded in timelines (Who to follow etc.):
// the header cell plus following cells containing user suggestions.
const hideInlineModules = (needles, contentSelector) => {
  const headers = document.querySelectorAll(`${selectors.primaryColumn} h2`);
  for (const h of headers) {
    if (!textMatches(h, needles)) continue;
    const headerCell = h.closest(selectors.cell);
    hide(headerCell);
    let next = headerCell?.nextElementSibling;
    while (next && (next.querySelector(contentSelector) || textMatches(next, ["show more"]))) {
      hide(next);
      next = next.nextElementSibling;
    }
  }
};

const hideSidebarModules = () => {
  if (settings.hideTrends) {
    document.querySelectorAll(selectors.sidebarTrends).forEach((el) => hide(el));
    // Fallback: any sidebar trend item -> hide its enclosing module.
    document
      .querySelectorAll(`${selectors.sidebarColumn} ${selectors.trendItem}`)
      .forEach((el) => hide(el.closest("section")?.parentElement || el));
  }
  if (settings.hideSuggestedAccounts) {
    document.querySelectorAll(selectors.sidebarWhoToFollow).forEach((el) => hide(el));
    document
      .querySelectorAll(`${selectors.sidebarColumn} ${selectors.userCell}`)
      .forEach((el) => hide(el.closest("aside") || el.closest("section")?.parentElement || el));
  }
};

const hideSuggestedPosts = () => {
  if (!settings.hideSuggestedPosts) return;
  // Posts labeled with a "Suggested"/promoted social context above the tweet.
  document
    .querySelectorAll(`${selectors.primaryColumn} [data-testid="socialContext"]`)
    .forEach((sc) => {
      if (textMatches(sc, ["suggested", "promoted", "based on", "you might like"])) {
        hide(sc.closest(selectors.cell));
      }
    });
};

const hideExploreNavLink = () => {
  if (!settings.hideExplore) return;
  document.querySelectorAll(selectors.exploreNavLink).forEach((el) => hide(el));
};

const onMutation = () => {
  if (!settings.enabled) return;

  const path = window.location.pathname;

  // Routes that must never be touched.
  const passThrough = [
    urls.messages,
    urls.notifications,
    urls.bookmarks,
    urls.lists,
    urls.compose,
  ];
  const isPassThrough = passThrough.some((p) => path.startsWith(p));

  if (!isPassThrough) {
    if (path === urls.home || path === "/") {
      handleHome();
    } else if (path.startsWith(urls.explore)) {
      handleExplore();
    } else if (/^\/[^/]+\/status\/\d+/.test(path)) {
      handleStatusPage();
    } else {
      // Leaving a blocked route via SPA navigation: clean up the screen.
      removeBlockedScreen();
    }

    if (settings.hideTrends && path.startsWith(urls.search)) {
      hideInlineModules(moduleHeaderTexts.trends, selectors.trendItem);
    }
    if (settings.hideSuggestedAccounts) {
      hideInlineModules(moduleHeaderTexts.suggestedAccounts, selectors.userCell);
    }
    hideSuggestedPosts();
  } else {
    removeBlockedScreen();
  }

  hideSidebarModules();
  hideExploreNavLink();
};

async function main() {
  settings = await loadSettings();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    for (const [key, { newValue }] of Object.entries(changes)) {
      settings[key] = newValue;
    }
    // Reset and re-apply so loosened settings take effect without a reload.
    unhideAll();
    removeBlockedScreen();
    onMutation();
  });

  const observer = new MutationObserver(onMutation);
  observer.observe(document, { subtree: true, childList: true });
  onMutation();
}

export { main };
