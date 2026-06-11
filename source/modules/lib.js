// Settings model. Keys map 1:1 to popup checkbox ids and chrome.storage.local keys.
export const defaultSettings = {
  enabled: true,
  blockHomeTimeline: true,
  blockForYou: true,
  allowFollowing: false,
  hideTrends: true,
  hideExplore: true,
  hideSuggestedAccounts: true,
  hideSuggestedPosts: true,
  hideMorePosts: true,
};

export const settingsKeys = Object.keys(defaultSettings);

// Pro state is stored separately from the blocking toggles so the free-tier
// settings loop stays untouched. Flip this to true (or via a future license
// check) to unlock the premium features stubbed in the popup.
export const PRO_KEY = "isPro";

export const loadPro = async () => {
  const { [PRO_KEY]: isPro } = await chrome.storage.local.get(PRO_KEY);
  return Boolean(isPro);
};

// Pro feature toggles. Implemented: proCustomMessage, proLocalStats.
// Still stubs: proScheduledBlocking, proKeywordMuting.
export const defaultProSettings = {
  proCustomMessage: false,
  proLocalStats: true,
  proScheduledBlocking: false,
  proKeywordMuting: false,
};

export const proSettingsKeys = Object.keys(defaultProSettings);
export const CUSTOM_MESSAGE_KEY = "proCustomMessageText";
export const STATS_KEY = "blockStats";

export const loadProSettings = async () => {
  const stored = await chrome.storage.local.get([
    ...proSettingsKeys,
    CUSTOM_MESSAGE_KEY,
  ]);
  return {
    ...defaultProSettings,
    [CUSTOM_MESSAGE_KEY]: "",
    ...stored,
  };
};

// Local focus stats: a per-day counter of blocked feed opens. Stays entirely
// in chrome.storage.local; pruned to the last 30 days.
const dayKey = (d) => d.toISOString().slice(0, 10);

export const recordBlock = async () => {
  const { [STATS_KEY]: stats = {} } = await chrome.storage.local.get(STATS_KEY);
  const today = dayKey(new Date());
  stats[today] = (stats[today] || 0) + 1;
  const cutoff = dayKey(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  for (const k of Object.keys(stats)) {
    if (k < cutoff) delete stats[k];
  }
  await chrome.storage.local.set({ [STATS_KEY]: stats });
};

export const summarizeStats = (stats = {}) => {
  const today = dayKey(new Date());
  const weekCutoff = dayKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  let week = 0;
  for (const [k, v] of Object.entries(stats)) {
    if (k >= weekCutoff) week += v;
  }
  return { today: stats[today] || 0, week };
};

// Replace with your own donation link (Ko-fi, Buy Me a Coffee, GitHub Sponsors).
export const DONATE_URL = "https://www.buymeacoffee.com/yourname";

// X's class names are obfuscated; only data-testid / aria-label / role hooks
// are reasonably stable. All selectors live here so DOM changes are a one-file fix.
export const selectors = {
  primaryColumn: '[data-testid="primaryColumn"]',
  sidebarColumn: '[data-testid="sidebarColumn"]',
  homeTimeline: 'div[aria-label*="Home timeline" i]',
  tabList: '[data-testid="primaryColumn"] [role="tablist"]',
  tab: '[role="tab"]',
  cell: '[data-testid="cellInnerDiv"]',
  trendItem: '[data-testid="trend"]',
  userCell: '[data-testid="UserCell"]',
  sidebarTrends: '[data-testid="sidebarColumn"] [aria-label*="trending" i]',
  sidebarWhoToFollow: '[data-testid="sidebarColumn"] aside[aria-label*="who to follow" i]',
  sidebarRelevantPeople: '[data-testid="sidebarColumn"] aside[aria-label*="relevant people" i]',
  exploreNavLink: 'a[data-testid="AppTabBar_Explore_Link"], nav a[href="/explore"]',
  searchBox: '[data-testid="SearchBox_Search_Input"]',
};

export const urls = {
  home: "/home",
  explore: "/explore",
  search: "/search",
  messages: "/messages",
  notifications: "/notifications",
  bookmarks: "/i/bookmarks",
  lists: "/i/lists",
  compose: "/compose/post",
};

// Section header texts used to identify recommendation modules inside timelines.
export const moduleHeaderTexts = {
  suggestedAccounts: ["who to follow", "you might like", "suggested for you", "creators for you"],
  morePosts: ["discover more", "more posts", "more tweets"],
  trends: ["what's happening", "trends for you", "trending now", "today's news"],
};

export const HIDDEN_ATTR = "data-anti-timeline-hidden";

export const hide = (elements) => {
  if (!elements) return;
  if (elements instanceof Node) elements = [elements];
  for (const el of elements) {
    if (el && el.style && el.style.display !== "none") {
      el.style.display = "none";
      el.setAttribute(HIDDEN_ATTR, "true");
    }
  }
};

// Undo everything we've hidden (used when settings change or extension is disabled).
export const unhideAll = () => {
  document.querySelectorAll(`[${HIDDEN_ATTR}]`).forEach((el) => {
    el.style.display = "";
    el.removeAttribute(HIDDEN_ATTR);
  });
};

export const loadSettings = async () => {
  const stored = await chrome.storage.local.get(settingsKeys);
  return { ...defaultSettings, ...stored };
};
