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
