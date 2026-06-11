export const BLOCKED_SCREEN_ID = "anti-timeline-blocked";

const shortcuts = [
  { label: "Post", href: "/compose/post" },
  { label: "Search", href: "/explore", search: true },
  { label: "Messages", href: "/messages" },
  { label: "Notifications", href: "/notifications" },
  { label: "Bookmarks", href: "/i/bookmarks" },
  { label: "Lists", href: "/i/lists" },
];

// Builds the replacement screen shown instead of a blocked feed.
export const buildBlockedScreen = (title, message = "Use X intentionally.") => {
  const root = document.createElement("div");
  root.id = BLOCKED_SCREEN_ID;
  root.style.cssText =
    "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "min-height:70vh;padding:32px;text-align:center;font-family:inherit;color:inherit;";

  const h1 = document.createElement("h1");
  h1.textContent = title;
  h1.style.cssText = "font-size:24px;font-weight:800;margin:0 0 8px;";

  const p = document.createElement("p");
  p.textContent = message;
  p.style.cssText = "font-size:15px;opacity:0.7;margin:0 0 28px;";

  const nav = document.createElement("div");
  nav.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:360px;";

  for (const s of shortcuts) {
    const a = document.createElement("a");
    a.textContent = s.label;
    a.href = s.href;
    a.style.cssText =
      "padding:10px 18px;border:1px solid rgba(128,128,128,0.5);border-radius:9999px;" +
      "text-decoration:none;color:inherit;font-size:14px;font-weight:600;";
    if (s.search) {
      // Focus X's own search box instead of navigating to the (possibly blocked) Explore page.
      a.addEventListener("click", (e) => {
        const box = document.querySelector('[data-testid="SearchBox_Search_Input"]');
        if (box) {
          e.preventDefault();
          box.focus();
        }
      });
    }
    nav.appendChild(a);
  }

  const settings = document.createElement("p");
  settings.textContent = "Change blocking options: click the Anti-Timeline icon in your toolbar.";
  settings.style.cssText = "font-size:13px;opacity:0.5;margin:32px 0 0;";

  root.append(h1, p, nav, settings);
  return root;
};

// Friction screen: a countdown the user must wait out before choosing to
// continue to the feed. onContinue is called when they click through.
export const buildBreathingScreen = (seconds, onContinue) => {
  const root = document.createElement("div");
  root.id = BLOCKED_SCREEN_ID;
  root.style.cssText =
    "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "min-height:70vh;padding:32px;text-align:center;font-family:inherit;color:inherit;";

  const h1 = document.createElement("h1");
  h1.textContent = "Take a breath";
  h1.style.cssText = "font-size:24px;font-weight:800;margin:0 0 8px;";

  const p = document.createElement("p");
  p.textContent = "Still want to scroll? The feed unlocks when the timer ends.";
  p.style.cssText = "font-size:15px;opacity:0.7;margin:0 0 24px;";

  const count = document.createElement("div");
  count.textContent = String(seconds);
  count.style.cssText = "font-size:48px;font-weight:800;margin:0 0 24px;font-variant-numeric:tabular-nums;";

  const btn = document.createElement("button");
  btn.textContent = "Continue to feed";
  btn.disabled = true;
  btn.style.cssText =
    "padding:10px 22px;border:none;border-radius:9999px;font-size:14px;font-weight:700;" +
    "background:#f4212e;color:#fff;cursor:pointer;opacity:0.4;";

  let remaining = seconds;
  const timer = setInterval(() => {
    remaining -= 1;
    count.textContent = String(Math.max(remaining, 0));
    if (remaining <= 0) {
      clearInterval(timer);
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }, 1000);

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    clearInterval(timer);
    onContinue();
  });

  const back = document.createElement("a");
  back.textContent = "Never mind — go to Messages";
  back.href = "/messages";
  back.style.cssText = "margin-top:20px;font-size:13px;opacity:0.6;color:inherit;";

  root.append(h1, p, count, btn, back);
  return root;
};
