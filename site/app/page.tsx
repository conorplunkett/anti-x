const GITHUB_URL = "https://github.com/conorplunkett/anti-x";
const DONATE_URL = "https://www.buymeacoffee.com/yourname"; // keep in sync with source/modules/lib.js

const blocked = [
  { emoji: "🏠", title: "Home timeline", desc: "No more landing on an infinite feed every time you open X." },
  { emoji: "✨", title: "“For You” feed", desc: "The algorithmic rabbit hole is gone. Optionally keep “Following”." },
  { emoji: "📈", title: "Trends", desc: "“What’s happening” stops happening to you." },
  { emoji: "🧭", title: "Explore", desc: "The Explore page and its nav link disappear entirely." },
  { emoji: "👤", title: "Suggested accounts", desc: "“Who to follow” and “You might like” modules are hidden." },
  { emoji: "🔁", title: "Suggested posts", desc: "Recommended and promoted posts injected into feeds are removed." },
  { emoji: "⬇️", title: "“More posts”", desc: "The “Discover more” trap under every tweet link is gone." },
];

const kept = [
  { emoji: "✍️", title: "Posting" },
  { emoji: "🔍", title: "Search" },
  { emoji: "💬", title: "DMs" },
  { emoji: "🔔", title: "Notifications" },
  { emoji: "🔖", title: "Bookmarks" },
  { emoji: "📋", title: "Lists" },
  { emoji: "🪪", title: "Profiles" },
  { emoji: "🔗", title: "Tweet links" },
];

const steps = [
  {
    n: "1",
    title: "Install it",
    desc: "Add Anti-Timeline to Chrome. No account, no sign-up, no onboarding. The defaults are already right.",
  },
  {
    n: "2",
    title: "Open X like you normally would",
    desc: "Instead of the feed, you see a calm blocked screen with shortcuts to the things you actually came for: posting, search, messages, notifications.",
  },
  {
    n: "3",
    title: "Do the thing. Leave.",
    desc: "Reply to the DM, post the thing, read the tweet someone sent you — then get on with your day. The feed never gets a chance to grab you.",
  },
];

const freeFeatures = [
  "Block Home timeline & For You feed",
  "Optionally allow the Following feed",
  "Hide Trends, Explore & all suggestions",
  "Hide “More posts” under tweets",
  "Calm blocked screen with useful shortcuts",
  "Toggles for everything — changes apply instantly",
  "Settings stay on your device",
  "No tracking, no analytics, no server. Ever.",
];

const proFeatures = [
  { title: "Scheduled blocking", desc: "Only block during work hours — or only allow X at lunch." },
  { title: "Daily feed budget", desc: "Allow the feed for, say, 15 minutes a day. Then it’s gone." },
  { title: "Breathing room", desc: "A countdown before the feed unlocks. Most of the time, you’ll close the tab." },
  { title: "Custom blocked-screen message", desc: "Replace the default with your own words. “Back to work.”" },
  { title: "Local focus stats", desc: "See how many feed-opens you blocked — computed on your device, never sent anywhere." },
];

const faqs = [
  {
    q: "Does it work on twitter.com and x.com?",
    a: "Yes, both. The extension runs on every X domain and behaves identically.",
  },
  {
    q: "Can I still use X for work?",
    a: "That’s the whole point. Posting, search, DMs, notifications, bookmarks, lists, profiles, and direct tweet links all keep working exactly as before. Only the passive-consumption surfaces are removed.",
  },
  {
    q: "What data do you collect?",
    a: "None. Not your history, not your tweets, not your clicks, not even anonymous analytics. There is no server to send anything to. Your settings live in your browser’s local storage and die with the uninstall.",
  },
  {
    q: "Why not just use a website blocker?",
    a: "Full blockers are too blunt — they cut off the useful parts of X along with the feed. Anti-Timeline removes only the parts engineered to keep you scrolling.",
  },
  {
    q: "What happens when X changes its design?",
    a: "X’s interface changes often. The extension targets X’s most stable internal markers, and all of them live in a single file — so fixes ship fast. It’s open source; you can even patch it yourself.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <span className="logo">
            <span className="logo-mark">⛔️</span> Anti-Timeline
          </span>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Free vs Pro</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener">
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <h1>
          Open X.
          <br />
          <span className="accent">Skip the feed.</span>
        </h1>
        <p className="lede">
          Anti-Timeline is a free Chrome extension that removes the Home
          timeline, For You feed, Trends, and every recommendation surface on
          Twitter/X — while keeping posting, search, DMs, and everything you
          actually need.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href={GITHUB_URL} target="_blank" rel="noopener">
            Get the extension
          </a>
          <a className="btn btn-ghost" href="#how">
            How it works
          </a>
        </div>
        <p className="hero-note">Free · Open source · No tracking, ever</p>

        {/* Mock of the blocked screen */}
        <div className="browser-mock" aria-hidden="true">
          <div className="browser-bar">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="url">x.com/home</span>
          </div>
          <div className="browser-body">
            <div className="mock-title">Timeline blocked</div>
            <div className="mock-sub">Use X intentionally.</div>
            <div className="mock-pills">
              {["Post", "Search", "Messages", "Notifications", "Bookmarks", "Lists"].map((p) => (
                <span className="pill" key={p}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Problem */}
      <section className="section narrow">
        <h2>You opened X to do one thing.</h2>
        <p className="body-lg">
          Send a DM. Post something. Read the tweet someone linked you. Then
          the Home feed loaded, “For You” had other plans, and twenty-five
          minutes vanished. That isn’t a willpower problem — the feed is
          engineered to do exactly that. Full site blockers are too blunt:
          they take away the useful tool along with the trap.{" "}
          <strong>
            Anti-Timeline removes the trap and keeps the tool.
          </strong>
        </p>
      </section>

      {/* Features: blocked */}
      <section className="section" id="features">
        <h2>What it removes</h2>
        <p className="section-sub">Every passive-consumption surface, hidden by default.</p>
        <div className="grid grid-3">
          {blocked.map((f) => (
            <div className="card" key={f.title}>
              <div className="card-emoji">{f.emoji}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features: kept */}
      <section className="section">
        <h2>What keeps working</h2>
        <p className="section-sub">
          Everything intentional is untouched. These pages are never blocked.
        </p>
        <div className="kept-row">
          {kept.map((k) => (
            <span className="kept-chip" key={k.title}>
              {k.emoji} {k.title}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how">
        <h2>How it works</h2>
        <div className="grid grid-3">
          {steps.map((s) => (
            <div className="card step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="tech card-wide">
          <h3>🛠 Under the hood (for the curious)</h3>
          <p>
            X is a single-page app that rebuilds itself constantly, so
            Anti-Timeline watches the page with a{" "}
            <code>MutationObserver</code> and reacts the moment X tries to
            render a feed, a trends module, or a suggestion. Blocked surfaces
            are replaced with a calm screen of shortcuts; everything else is
            simply hidden. Your toggles are stored with{" "}
            <code>chrome.storage.local</code> and apply live — no page reload
            needed. The extension requests exactly one permission
            (<code>storage</code>), makes <strong>zero network requests</strong>,
            and contains no analytics of any kind. The entire codebase is open
            source and small enough to read over coffee.
          </p>
        </div>
      </section>

      {/* Free vs Pro */}
      <section className="section" id="pricing">
        <h2>Free does everything you need</h2>
        <p className="section-sub">
          The full blocker is free, forever. Pro adds optional habit tools on
          top — for people who want guardrails, not just walls.
        </p>

        <div className="plans">
          <div className="plan plan-free">
            <div className="plan-badge">Free · Forever</div>
            <h3>Anti-Timeline</h3>
            <p className="plan-tag">The complete blocker. Not a trial. Not a teaser.</p>
            <ul>
              {freeFeatures.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <a className="btn btn-primary btn-block" href={GITHUB_URL} target="_blank" rel="noopener">
              Get it free
            </a>
          </div>

          <div className="plan plan-pro">
            <div className="plan-badge pro">Pro · Optional</div>
            <h3>Anti-Timeline Pro</h3>
            <p className="plan-tag">
              Everything in Free, plus habit tools. Still 100% local, still zero
              tracking.
            </p>
            <ul>
              {proFeatures.map((f) => (
                <li key={f.title}>
                  <strong>{f.title}</strong> — {f.desc}
                </li>
              ))}
            </ul>
            <span className="btn btn-ghost btn-block disabled">Coming soon</span>
          </div>
        </div>

        {/* Donation — right under the two versions */}
        <div className="donate">
          <h3>☕️ Anti-Timeline is free. It’s going to stay free.</h3>
          <p>
            No ads, no data sales, no dark patterns — which also means no
            revenue. If this extension gives you back even one scroll-free
            afternoon, you can buy me a coffee. It keeps the selectors updated
            every time X redesigns itself.
          </p>
          <a className="btn btn-donate" href={DONATE_URL} target="_blank" rel="noopener">
            ☕️ Support the project
          </a>
        </div>
      </section>

      {/* Privacy */}
      <section className="section narrow">
        <h2>Privacy isn’t a feature. It’s the architecture.</h2>
        <p className="body-lg">
          Anti-Timeline collects <strong>nothing</strong>. No browsing history,
          no tweet content, no DMs, no usernames, no clicks, no time-spent, no
          “anonymous” analytics. There is no server — the extension physically
          cannot phone home. Your settings live in your browser and nowhere
          else. You can verify all of this yourself: the{" "}
          <a href={GITHUB_URL} target="_blank" rel="noopener">
            source code is public
          </a>
          .
        </p>
      </section>

      {/* FAQ */}
      <section className="section narrow">
        <h2>Questions</h2>
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section final">
        <h2>Use X. Don’t let X use you.</h2>
        <a className="btn btn-primary btn-lg" href={GITHUB_URL} target="_blank" rel="noopener">
          Get Anti-Timeline
        </a>
      </section>

      <footer className="footer">
        <span>⛔️ Anti-Timeline</span>
        <div>
          <a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>
          <a href={`${GITHUB_URL}/blob/main/store/privacy.md`} target="_blank" rel="noopener">Privacy</a>
          <a href={DONATE_URL} target="_blank" rel="noopener">Donate</a>
        </div>
        <span className="footer-note">Not affiliated with X Corp. MIT licensed.</span>
      </footer>
    </main>
  );
}
