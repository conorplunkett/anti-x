import {
  defaultSettings,
  defaultProSettings,
  selectors,
  urls,
  moduleHeaderTexts,
  hide,
  unhideAll,
  loadSettings,
  loadPro,
  loadProSettings,
  recordBlock,
  isWithinSchedule,
  getBudgetUsedToday,
  recordBudgetSeconds,
  todayKey,
  PRO_KEY,
  CUSTOM_MESSAGE_KEY,
  STATS_KEY,
  BUDGET_USAGE_KEY,
  HIDDEN_ATTR,
} from "./lib.js";
import {
  buildBlockedScreen,
  buildBreathingScreen,
  BLOCKED_SCREEN_ID,
} from "./blocked-screen.js";

let settings = { ...defaultSettings };
let pro = { isPro: false, ...defaultProSettings, [CUSTOM_MESSAGE_KEY]: "" };

// Time-gate state (all in-memory; budget usage is persisted via lib.js).
const TICK_SECONDS = 10;
const BREATHING_GRANT_MS = 5 * 60 * 1000;
const breathingGrants = {}; // surface -> expiry timestamp
let budgetUsedToday = 0;
let budgetDate = todayKey();
let lastScheduleActive = null;

// Scheduled blocking: when enabled and outside the window, the extension
// behaves as if disabled.
const blockingActiveNow = () =>
  !(pro.isPro && pro.proScheduledBlocking) ||
  isWithinSchedule(pro.proScheduleStart, pro.proScheduleEnd);

const budgetRemainingSeconds = () =>
  (Number(pro.proDailyBudgetMinutes) || 0) * 60 - budgetUsedToday;

const textMatches = (el, needles) => {
  const text = (el?.textContent || "").trim().toLowerCase();
  return needles.some((n) => text.includes(n));
};

const removeBlockedScreen = () => {
  document.getElementById(BLOCKED_SCREEN_ID)?.remove();
};

const findTimelineRegion = () => {
  const column = document.querySelector(selectors.primaryColumn);
  return (
    column?.querySelector('div[aria-label*="timeline" i]') ||
    column?.querySelector("section[role='region']") ||
    null
  );
};

// Hide the timeline region and mount a replacement screen in its place.
// `type` distinguishes screens (blocked vs breathing) so the observer doesn't
// rebuild an existing one, but a mode change swaps it. Returns true if a new
// screen was created.
const mountScreen = (type, build) => {
  const existing = document.getElementById(BLOCKED_SCREEN_ID);
  if (existing) {
    if (existing.dataset.screen === type) return false;
    existing.remove();
  }
  const column = document.querySelector(selectors.primaryColumn);
  if (!column) return false;
  const region = findTimelineRegion();
  hide(region);
  const el = build();
  el.dataset.screen = type;
  (region?.parentElement || column).appendChild(el);
  return true;
};

// Keeps the page header (and home tab bar) visible.
const blockTimeline = (title) => {
  const customText = (pro[CUSTOM_MESSAGE_KEY] || "").trim();
  const message =
    pro.isPro && pro.proCustomMessage && customText ? customText : undefined;
  const created = mountScreen(`blocked:${title}`, () =>
    buildBlockedScreen(title, message)
  );
  if (created && pro.isPro && pro.proLocalStats) recordBlock();
};

const showBreathingScreen = (surface) => {
  mountScreen(`breathing:${surface}`, () =>
    buildBreathingScreen(Math.max(Number(pro.proBreathingSeconds) || 30, 3), () => {
      breathingGrants[surface] = Date.now() + BREATHING_GRANT_MS;
      restoreTimeline();
      onMutation();
    })
  );
};

// Undo feed blocking: remove our screen and unhide the timeline region.
const restoreTimeline = () => {
  removeBlockedScreen();
  const region = findTimelineRegion();
  if (region?.getAttribute(HIDDEN_ATTR)) {
    region.style.display = "";
    region.removeAttribute(HIDDEN_ATTR);
  }
};

// Decide what to show for a feed surface that blocking applies to.
// Precedence: daily budget (home only) > breathing room > hard block.
const applyFeedGate = (surface, wantBlock, title, { budget = false } = {}) => {
  if (budget && pro.isPro && pro.proDailyBudget) {
    // Budget mode: the feed is allowed until today's minutes run out,
    // regardless of the block toggles — then it's a hard block.
    if (budgetRemainingSeconds() > 0) {
      restoreTimeline();
    } else {
      blockTimeline("Daily limit reached");
    }
    return;
  }
  if (!wantBlock) {
    restoreTimeline();
    return;
  }
  if (pro.isPro && pro.proBreathingRoom) {
    if ((breathingGrants[surface] || 0) > Date.now()) {
      restoreTimeline();
    } else {
      showBreathingScreen(surface);
    }
    return;
  }
  blockTimeline(title);
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
  const wantBlock =
    (settings.blockHomeTimeline || settings.blockForYou) && !allowThisTab;

  applyFeedGate("home", wantBlock, "Timeline blocked", { budget: true });
};

const handleExplore = () => {
  applyFeedGate("explore", settings.hideExplore, "Explore blocked");
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
  if (!settings.enabled || !blockingActiveNow()) return;

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

// Runs every TICK_SECONDS: handles schedule transitions (which happen by time
// passing, not by mutations) and accrues daily budget usage while the user is
// actually viewing an unblocked home feed in a visible tab.
const tick = () => {
  const active = blockingActiveNow();
  if (lastScheduleActive !== null && active !== lastScheduleActive) {
    unhideAll();
    removeBlockedScreen();
  }
  lastScheduleActive = active;
  if (!active || !settings.enabled) return;
  onMutation();

  const path = window.location.pathname;
  const onHome = path === urls.home || path === "/";
  const feedVisible = !document.getElementById(BLOCKED_SCREEN_ID);
  if (
    pro.isPro &&
    pro.proDailyBudget &&
    onHome &&
    feedVisible &&
    document.visibilityState === "visible"
  ) {
    const today = todayKey();
    if (today !== budgetDate) {
      budgetDate = today;
      budgetUsedToday = 0;
    }
    budgetUsedToday += TICK_SECONDS;
    recordBudgetSeconds(TICK_SECONDS);
    if (budgetRemainingSeconds() <= 0) onMutation();
  }
};

async function main() {
  settings = await loadSettings();
  pro = { isPro: await loadPro(), ...(await loadProSettings()) };
  budgetUsedToday = await getBudgetUsedToday();
  lastScheduleActive = blockingActiveNow();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    let changed = false;
    for (const [key, { newValue }] of Object.entries(changes)) {
      // Stats and budget writes come from this script itself; reacting to
      // them would rebuild the blocked screen and record again, looping.
      if (key === STATS_KEY) continue;
      if (key === BUDGET_USAGE_KEY) {
        // Another x.com tab may have ticked the budget; stay in sync.
        const usage = changes[key].newValue || {};
        budgetUsedToday = Math.max(budgetUsedToday, usage[todayKey()] || 0);
        continue;
      }
      if (key === PRO_KEY) {
        pro.isPro = Boolean(newValue);
      } else if (key in pro) {
        pro[key] = newValue;
      } else {
        settings[key] = newValue;
      }
      changed = true;
    }
    if (!changed) return;
    // Reset and re-apply so loosened settings take effect without a reload.
    unhideAll();
    removeBlockedScreen();
    onMutation();
  });

  const observer = new MutationObserver(onMutation);
  observer.observe(document, { subtree: true, childList: true });
  onMutation();

  setInterval(tick, TICK_SECONDS * 1000);
}

export { main };
